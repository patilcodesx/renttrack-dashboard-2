import { Link } from 'react-router-dom';
import { Mail, Phone, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tenant } from '@/lib/mockData';

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const statusColors = {
    active: 'badge-success',
    pending: 'badge-warning',
    inactive: 'badge-muted',
  };

  return (
    <article className="stat-card group">
      <div className="flex items-start gap-4">
        <img
          src={tenant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.id}`}
          alt={tenant.name}
          className="h-14 w-14 rounded-full border-2 border-border"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">
                {tenant.name}
              </h3>
              <span className={cn('badge mt-1', statusColors[tenant.status])}>
                {tenant.status}
              </span>
            </div>
            <Link
              to={`/tenants/${tenant.id}`}
              className="btn-outline px-3 py-1.5 text-sm shrink-0"
            >
              View
            </Link>
          </div>

          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{tenant.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              {tenant.phone}
            </p>
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{tenant.propertyName}</span>
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Rent</span>
            <span className="font-semibold text-primary">
              ${tenant.rentAmount.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function TenantCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex items-start gap-4">
        <div className="skeleton h-14 w-14 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="skeleton h-5 w-32"></div>
              <div className="skeleton h-5 w-16 rounded-full"></div>
            </div>
            <div className="skeleton h-8 w-16 rounded-lg"></div>
          </div>
          <div className="space-y-1.5">
            <div className="skeleton h-4 w-48"></div>
            <div className="skeleton h-4 w-32"></div>
            <div className="skeleton h-4 w-40"></div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="skeleton h-4 w-12"></div>
            <div className="skeleton h-5 w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
