import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Filter } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { TenantCard, TenantCardSkeleton } from '@/components/ui/TenantCard';
import type { Tenant } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await apiClient.getTenants();
        setTenants(data);
        setFilteredTenants(data);
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  useEffect(() => {
    let filtered = [...tenants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          t.phone.includes(query) ||
          t.propertyName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    setFilteredTenants(filtered);
  }, [tenants, searchQuery, statusFilter]);

  const statusCounts = {
    all: tenants.length,
    active: tenants.filter((t) => t.status === 'active').length,
    pending: tenants.filter((t) => t.status === 'pending').length,
    inactive: tenants.filter((t) => t.status === 'inactive').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground">
            {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/onboarding" className="btn-primary">
          <UserPlus className="h-4 w-4" />
          Add Tenant
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full"
            aria-label="Search tenants"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'active', 'pending', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium capitalize whitespace-nowrap transition-colors',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {status}
              <span className="ml-1.5 text-xs opacity-70">({statusCounts[status]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tenant grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <TenantCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-lg font-medium text-foreground">No tenants found</p>
          <p className="mt-2 text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first tenant'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link to="/onboarding" className="btn-primary mt-4 inline-flex">
              <UserPlus className="h-4 w-4" />
              Add Tenant
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
