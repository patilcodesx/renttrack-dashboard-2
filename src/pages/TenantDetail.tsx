import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  Download,
  Eye,
  Building2,
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { DataTable } from '@/components/ui/DataTable';
import type { Tenant, Payment } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [tenantData, ledgerData] = await Promise.all([
          apiClient.getTenant(id),
          apiClient.getTenantLedger(id),
        ]);
        setTenant(tenantData);
        setPayments(ledgerData);
      } catch (error) {
        console.error('Failed to fetch tenant data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusColors = {
    active: 'badge-success',
    pending: 'badge-warning',
    inactive: 'badge-muted',
  };

  const paymentStatusColors = {
    paid: 'badge-success',
    due: 'badge-warning',
    overdue: 'badge-destructive',
  };

  const paymentColumns = [
    { key: 'month', header: 'Month', sortable: true },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (item: Payment) => formatDate(item.dueDate),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (item: Payment) => `$${item.amount.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Payment) => (
        <span className={cn('badge capitalize', paymentStatusColors[item.status])}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'paidDate',
      header: 'Paid Date',
      render: (item: Payment) => (item.paidDate ? formatDate(item.paidDate) : '-'),
    },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="skeleton h-8 w-32"></div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-32 rounded-lg"></div>
            <div className="skeleton h-48 rounded-lg"></div>
          </div>
          <div className="skeleton h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="animate-fade-in text-center py-12">
        <h1 className="text-2xl font-bold text-foreground">Tenant Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The tenant you're looking for doesn't exist.
        </p>
        <Link to="/tenants" className="btn-primary mt-4 inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button */}
      <Link
        to="/tenants"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenants
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <img
                src={tenant.avatar}
                alt={tenant.name}
                className="h-20 w-20 rounded-full border-2 border-border"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{tenant.name}</h1>
                    <span className={cn('badge mt-1', statusColors[tenant.status])}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {tenant.email}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {tenant.phone}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                    <MapPin className="h-4 w-4" />
                    {tenant.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lease summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Lease Summary
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Property</dt>
                <dd className="font-medium">{tenant.propertyName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Monthly Rent</dt>
                <dd className="font-medium text-primary">${tenant.rentAmount.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Security Deposit</dt>
                <dd className="font-medium">${tenant.deposit.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Lease Period</dt>
                <dd className="font-medium">
                  {formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Payments ledger */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment History
              </h2>
            </div>
            <DataTable
              data={payments}
              columns={paymentColumns}
              keyExtractor={(item) => item.id}
              emptyMessage="No payment history"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* ID Badge */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground mb-3">Government ID</h3>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm text-muted-foreground">ID Number</p>
              <p className="font-mono font-medium">{tenant.govtId}</p>
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documents
            </h3>
            <div className="space-y-2">
              {['Lease Agreement', 'ID Copy', 'Proof of Income'].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between rounded-lg bg-muted p-3"
                >
                  <span className="text-sm">{doc}</span>
                  <div className="flex gap-1">
                    <button
                      className="btn-ghost p-1.5 text-muted-foreground hover:text-foreground"
                      aria-label={`View ${doc}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="btn-ghost p-1.5 text-muted-foreground hover:text-foreground"
                      aria-label={`Download ${doc}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity log */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Activity Log
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-1 rounded-full bg-primary"></div>
                <div>
                  <p className="text-foreground">Tenant onboarded</p>
                  <p className="text-xs text-muted-foreground">{formatDate(tenant.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1 rounded-full bg-success"></div>
                <div>
                  <p className="text-foreground">Lease signed</p>
                  <p className="text-xs text-muted-foreground">{formatDate(tenant.leaseStart)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
