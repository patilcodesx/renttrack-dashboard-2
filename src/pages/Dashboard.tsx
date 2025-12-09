import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Calendar,
  DollarSign,
  UserPlus,
  Upload,
  Building2,
  ArrowRight,
  Activity,
} from 'lucide-react';

import { apiClient } from '@/lib/apiClient';
import { StatCard, StatCardSkeleton } from '@/components/ui/StatCard';
import type { Activity as ActivityType } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { getRole } from '@/lib/auth';   // NEW: Role-based UI

const activityIcons = {
  tenant_added: Users,
  payment_received: DollarSign,
  document_uploaded: Upload,
  lease_renewed: Calendar,
  property_added: Building2,
};

const activityColors = {
  tenant_added: 'bg-info/10 text-info',
  payment_received: 'bg-success/10 text-success',
  document_uploaded: 'bg-primary/10 text-primary',
  lease_renewed: 'bg-warning/10 text-warning',
  property_added: 'bg-accent text-accent-foreground',
};

export default function Dashboard() {
  const [stats, setStats] = useState<{
    totalTenants: number;
    overdue: number;
    nextDueDate: string;
    totalRevenue: number;
  } | null>(null);

  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const role = getRole(); // "ADMIN" | "LANDLORD" | "TENANT"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getRecentActivity(),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total Tenants"
              value={stats.totalTenants}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Overdue Payments"
              value={stats.overdue}
              icon={AlertTriangle}
              iconClassName="bg-destructive/10 text-destructive"
            />
            <StatCard
              title="Next Due Date"
              value={formatDate(stats.nextDueDate)}
              icon={Calendar}
              iconClassName="bg-warning/10 text-warning"
            />
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              iconClassName="bg-success/10 text-success"
              trend={{ value: 8, isPositive: true }}
            />
          </>
        ) : null}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Recent Activity</h2>
              </div>

              <Link
                to="/payments"
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-4">
                    <div className="skeleton h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : activities.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No recent activity</div>
              ) : (
                activities.map((activity) => {
                  const Icon = activityIcons[activity.type];
                  return (
                    <div key={activity.id} className="flex gap-3 p-4">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full',
                          activityColors[activity.type]
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS (Role-Based) */}
        <div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="font-semibold mb-4">Quick Actions</h2>

            <div className="space-y-3">
              {/* Add Tenant — LANDLORD + ADMIN */}
              {(role === 'LANDLORD' || role === 'ADMIN') && (
                <Link
                  to="/onboarding"
                  className="flex items-center gap-3 rounded-lg border p-3 transition hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Add Tenant</p>
                    <p className="text-xs text-muted-foreground">Onboard a new tenant</p>
                  </div>
                </Link>
              )}

              {/* Upload Form — ALL roles */}
              <Link
                to="/upload"
                className="flex items-center gap-3 rounded-lg border p-3 transition hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <Upload className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="font-medium">Upload Form</p>
                  <p className="text-xs text-muted-foreground">Process documents with OCR</p>
                </div>
              </Link>

              {/* Add Property — LANDLORD + ADMIN */}
              {(role === 'LANDLORD' || role === 'ADMIN') && (
                <Link
                  to="/properties/new"
                  className="flex items-center gap-3 rounded-lg border p-3 transition hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <Building2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Add Property</p>
                    <p className="text-xs text-muted-foreground">List a new property</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Help Card */}
          <div className="mt-4 rounded-lg bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
            <h3 className="font-semibold">Need Help?</h3>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Check out our documentation or contact support for assistance.
            </p>
            <button className="mt-3 rounded-lg bg-primary-foreground/20 px-3 py-1.5 text-sm hover:bg-primary-foreground/30">
              View Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
