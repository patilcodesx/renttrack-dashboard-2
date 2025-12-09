import { useEffect, useState } from 'react';
import { DollarSign, Plus, Check } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { InputField } from '@/components/ui/InputField';
import { toast } from '@/components/ui/AppToast';
import type { Payment, Tenant } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [manualPayment, setManualPayment] = useState({
    tenantId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'bank_transfer',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsData, tenantsData] = await Promise.all([
          apiClient.getPayments(),
          apiClient.getTenants(),
        ]);
        setPayments(paymentsData);
        setTenants(tenantsData);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleMarkPaid = async () => {
    if (!selectedPayment) return;

    setIsProcessing(true);

    try {
      const updated = await apiClient.markPaymentPaid(selectedPayment.id, {
        method: 'manual',
        paidDate: new Date().toISOString().split('T')[0],
      });

      setPayments((prev) =>
        prev.map((p) => (p.id === selectedPayment.id ? updated : p))
      );

      toast.success('Payment marked as paid', `$${selectedPayment.amount.toLocaleString()} recorded.`);
      setShowConfirmModal(false);
      setSelectedPayment(null);
    } catch (error) {
      toast.error('Failed to update payment', 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordManual = async () => {
    if (!manualPayment.tenantId || !manualPayment.amount) {
      toast.warning('Missing information', 'Please fill in all required fields.');
      return;
    }

    setIsProcessing(true);

    try {
      const newPayment = await apiClient.recordManualPayment({
        tenantId: manualPayment.tenantId,
        amount: Number(manualPayment.amount),
        date: manualPayment.date,
        method: manualPayment.method,
      });

      setPayments((prev) => [newPayment, ...prev]);
      toast.success('Payment recorded', `$${newPayment.amount.toLocaleString()} recorded successfully.`);
      setShowManualModal(false);
      setManualPayment({
        tenantId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'bank_transfer',
      });
    } catch (error) {
      toast.error('Failed to record payment', 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const statusColors = {
    paid: 'badge-success',
    due: 'badge-warning',
    overdue: 'badge-destructive',
  };

  const columns = [
    { key: 'tenantName', header: 'Tenant', sortable: true },
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
      render: (item: Payment) => (
        <span className="font-medium">${item.amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Payment) => (
        <span className={cn('badge capitalize', statusColors[item.status])}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Payment) =>
        item.status !== 'paid' ? (
          <button
            onClick={() => {
              setSelectedPayment(item);
              setShowConfirmModal(true);
            }}
            className="btn-outline px-3 py-1.5 text-sm"
          >
            <Check className="h-3 w-3" />
            Mark Paid
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">
            {item.paidDate ? formatDate(item.paidDate) : '-'}
          </span>
        ),
    },
  ];

  // Stats
  const totalDue = payments
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter((p) => p.status === 'overdue').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track and manage rent payments</p>
        </div>
        <button onClick={() => setShowManualModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Due</p>
              <p className="text-xl font-bold text-foreground">${totalDue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Collected</p>
              <p className="text-xl font-bold text-foreground">${totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <DollarSign className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-xl font-bold text-foreground">{overdueCount} payment{overdueCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments table */}
      <DataTable
        data={payments}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No payments recorded yet"
      />

      {/* Confirm mark as paid modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedPayment(null);
        }}
        onConfirm={handleMarkPaid}
        title="Mark Payment as Paid"
        description={`Are you sure you want to mark the ${selectedPayment?.month} payment of $${selectedPayment?.amount.toLocaleString()} from ${selectedPayment?.tenantName} as paid?`}
        confirmText="Mark as Paid"
        isLoading={isProcessing}
      />

      {/* Record manual payment modal */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Record Manual Payment"
        description="Record a payment received outside the system"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tenant <span className="text-destructive">*</span>
            </label>
            <select
              value={manualPayment.tenantId}
              onChange={(e) => setManualPayment((prev) => ({ ...prev, tenantId: e.target.value }))}
              className="input-field"
              aria-label="Select tenant"
            >
              <option value="">Select a tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - {tenant.propertyName}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Amount"
            type="number"
            value={manualPayment.amount}
            onChange={(e) => setManualPayment((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="2500"
            required
          />

          <InputField
            label="Payment Date"
            type="date"
            value={manualPayment.date}
            onChange={(e) => setManualPayment((prev) => ({ ...prev, date: e.target.value }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Payment Method
            </label>
            <select
              value={manualPayment.method}
              onChange={(e) => setManualPayment((prev) => ({ ...prev, method: e.target.value }))}
              className="input-field"
              aria-label="Payment method"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="credit_card">Credit Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setShowManualModal(false)} className="btn-outline">
              Cancel
            </button>
            <button onClick={handleRecordManual} className="btn-primary" disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Recording...
                </span>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
