import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  Sliders,
  RefreshCw,
  Download,
  Shield,
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { DataTable } from '@/components/ui/DataTable';
import { toast } from '@/components/ui/AppToast';
import type { User } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function Settings() {
  const [users, setUsers] = useState<User[]>([]);
  const [ocrAccuracy, setOcrAccuracy] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, settingsData] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getSettings(),
        ]);
        setUsers(usersData);
        setOcrAccuracy(settingsData.ocrAccuracy);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOcrAccuracyChange = async (value: number) => {
    setOcrAccuracy(value);
    try {
      await apiClient.updateSettings({ ocrAccuracy: value });
      toast.success('Settings saved', 'OCR accuracy threshold updated.');
    } catch (error) {
      toast.error('Failed to save settings', 'Please try again.');
    }
  };

  const handleReprocess = async () => {
    setIsReprocessing(true);
    try {
      const result = await apiClient.reprocessFailedOCR();
      toast.success('Reprocessing complete', `${result.processed} jobs reprocessed.`);
    } catch (error) {
      toast.error('Reprocessing failed', 'Please try again.');
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleExport = async (type: 'tenants' | 'payments') => {
    setIsExporting(type);
    try {
      const blob = type === 'tenants'
        ? await apiClient.exportTenantsCSV()
        : await apiClient.exportPaymentsCSV();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export complete', `${type} data downloaded successfully.`);
    } catch (error) {
      toast.error('Export failed', 'Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const roleColors = {
    admin: 'badge-info',
    manager: 'badge-warning',
    viewer: 'badge-muted',
  };

  const userColumns = [
    {
      key: 'name',
      header: 'User',
      render: (item: User) => (
        <div className="flex items-center gap-3">
          <img
            src={item.avatar}
            alt={item.name}
            className="h-8 w-8 rounded-full border border-border"
          />
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item: User) => (
        <span className={cn('badge capitalize', roleColors[item.role])}>
          {item.role}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (item: User) => (
        <span className="text-sm text-muted-foreground">{formatDate(item.lastLogin)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage application settings and users</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User management */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </h2>
            </div>
            <DataTable
              data={users}
              columns={userColumns}
              keyExtractor={(item) => item.id}
              isLoading={isLoading}
              emptyMessage="No users found"
            />
          </div>

          {/* Data export */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Data Export
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Download your data as CSV files for backup or external analysis.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleExport('tenants')}
                className="btn-outline"
                disabled={isExporting !== null}
              >
                {isExporting === 'tenants' ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Exporting...
                  </span>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Tenants
                  </>
                )}
              </button>
              <button
                onClick={() => handleExport('payments')}
                className="btn-outline"
                disabled={isExporting !== null}
              >
                {isExporting === 'payments' ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Exporting...
                  </span>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Payments
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* OCR settings */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              OCR Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    Accuracy Threshold
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(ocrAccuracy * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={ocrAccuracy}
                  onChange={(e) => handleOcrAccuracyChange(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="OCR accuracy threshold"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Fields below this confidence level will be marked for manual review.
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={handleReprocess}
                  className="btn-outline w-full"
                  disabled={isReprocessing}
                >
                  {isReprocessing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Reprocessing...
                    </span>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Reprocess Failed Jobs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security info */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data Encryption</span>
                <span className="badge badge-success">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Two-Factor Auth</span>
                <span className="badge badge-muted">Disabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Audit</span>
                <span className="text-foreground">Dec 5, 2024</span>
              </div>
            </div>
          </div>

          {/* Mock mode info */}
          <div className="rounded-lg bg-info/10 border border-info/30 p-4">
            <h3 className="font-medium text-info">Mock Mode Active</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The application is running with mock data. All changes are stored locally and will be reset on page refresh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
