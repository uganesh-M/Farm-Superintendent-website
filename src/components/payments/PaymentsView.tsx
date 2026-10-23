import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  User,
  X,
  CreditCard,
} from 'lucide-react';
import { Payment, Worker, WorkRecord, PaymentMethod, PaymentStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { StatusText } from '../common/StatusText';
import { useLanguage } from '../../i18n/LanguageContext';

interface PaymentsViewProps {
  payments: Payment[];
  workers: Worker[];
  workRecords: WorkRecord[];
  currency: string;
  onSavePayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => { success: boolean };
  initialModalOpen?: boolean;
  preselectedWorkerId?: string | null;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  workers,
  workRecords,
  currency,
  onSavePayment,
  onDeletePayment,
  initialModalOpen = false,
  preselectedWorkerId = null,
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [workerFilter, setWorkerFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen || !!preselectedWorkerId);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Compute aggregated stats
  const totalEarnedWages = workRecords.reduce((sum, r) => sum + (Number(r.wageAmount) || 0), 0);
  const totalDisbursed = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalAdvances = payments
    .filter((p) => p.status === 'ADVANCE')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const netPending = Math.max(0, totalEarnedWages - totalDisbursed);

  // Form state
  const [formData, setFormData] = useState<{
    workerId: string;
    date: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    referenceNo: string;
    notes: string;
  }>({
    workerId: preselectedWorkerId || workers[0]?.id || '',
    date: new Date().toISOString().slice(0, 10),
    amount: 500,
    paymentMethod: 'CASH',
    status: 'PAID',
    referenceNo: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const worker = workers.find((w) => w.id === payment.workerId);
      const matchesSearch =
        (worker && worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.referenceNo && payment.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.notes && payment.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesWorker = workerFilter === 'ALL' || payment.workerId === workerFilter;
      const matchesMethod = methodFilter === 'ALL' || payment.paymentMethod === methodFilter;
      const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

      return matchesSearch && matchesWorker && matchesMethod && matchesStatus;
    });
  }, [payments, workers, searchTerm, workerFilter, methodFilter, statusFilter]);

  const handleOpenAddModal = (workerId?: string) => {
    const targetWorkerId = workerId || workers[0]?.id || '';
    setEditingPayment(null);

    // If worker specified, try to find their pending balance
    let suggestedAmount = 500;
    if (targetWorkerId) {
      const earned = workRecords
        .filter((r) => r.workerId === targetWorkerId)
        .reduce((sum, r) => sum + (Number(r.wageAmount) || 0), 0);
      const paid = payments
        .filter((p) => p.workerId === targetWorkerId && p.status === 'PAID')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const due = Math.max(0, earned - paid);
      if (due > 0) suggestedAmount = due;
    }

    setFormData({
      workerId: targetWorkerId,
      date: new Date().toISOString().slice(0, 10),
      amount: suggestedAmount,
      paymentMethod: 'CASH',
      status: 'PAID',
      referenceNo: '',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      workerId: payment.workerId,
      date: payment.date,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      referenceNo: payment.referenceNo || '',
      notes: payment.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.workerId) errors.workerId = 'Worker selection is required';
    if (!formData.date) errors.date = 'Payment date is required';
    if (formData.amount <= 0) errors.amount = 'Payment amount must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const paymentToSave: Payment = {
      id: editingPayment ? editingPayment.id : `pay-${Date.now()}`,
      workerId: formData.workerId,
      date: formData.date,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      referenceNo: formData.referenceNo.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: editingPayment ? editingPayment.createdAt : new Date().toISOString(),
    };

    onSavePayment(paymentToSave);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!paymentToDelete) return;
    onDeletePayment(paymentToDelete.id);
    setPaymentToDelete(null);
  };

  // Get selected worker's current due for display inside the modal
  const selectedWorkerDue = useMemo(() => {
    if (!formData.workerId) return 0;
    const earned = workRecords
      .filter((r) => r.workerId === formData.workerId)
      .reduce((sum, r) => sum + (Number(r.wageAmount) || 0), 0);
    const paid = payments
      .filter((p) => p.workerId === formData.workerId && p.status === 'PAID')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return Math.max(0, earned - paid);
  }, [formData.workerId, workRecords, payments]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202A24] tracking-tight">
            {t('paymentsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#657168] mt-0.5">
            {t('paymentsSubtitle')}
          </p>
        </div>
        <button
          onClick={() => handleOpenAddModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs self-start sm:self-auto focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('actionRecordPayment')}</span>
        </button>
      </div>

      {/* Financial Health Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
          <span className="text-xs font-medium text-[#657168] block">Total Wages Incurred</span>
          <span className="text-xl font-bold text-[#202A24] font-tabular mt-1 block">
            {formatCurrency(totalEarnedWages, currency)}
          </span>
          <span className="text-[11px] text-[#657168]">{workRecords.length} recorded shifts</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
          <span className="text-xs font-medium text-[#657168] block">{t('statTotalPaid')}</span>
          <span className="text-xl font-bold text-[#2E7D4F] font-tabular mt-1 block">
            {formatCurrency(totalDisbursed, currency)}
          </span>
          <span className="text-[11px] text-[#657168]">Settled disbursements</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#DCE4DC]">
          <span className="text-xs font-medium text-[#657168] block">{t('statusAdvance')}</span>
          <span className="text-xl font-bold text-[#B7791F] font-tabular mt-1 block">
            {formatCurrency(totalAdvances, currency)}
          </span>
          <span className="text-[11px] text-[#657168]">Disbursed early advances</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E6B84A]">
          <span className="text-xs font-medium text-[#657168] block">{t('balanceDue')}</span>
          <span className="text-xl font-bold text-[#C0392B] font-tabular mt-1 block">
            {formatCurrency(netPending, currency)}
          </span>
          <span className="text-[11px] text-[#657168]">
            {netPending === 0 ? 'All wages up to date' : 'Pending wage disbursements'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#DCE4DC] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#657168] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by worker name, voucher or reference ID..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] placeholder-[#657168] focus:outline-hidden focus:border-[#1F5D42] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} {t('workersTitle')}</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} Methods</option>
            <option value="CASH">{t('methodCash')}</option>
            <option value="UPI">{t('methodUPI')}</option>
            <option value="BANK_TRANSFER">{t('methodBank')}</option>
            <option value="CHEQUE">{t('methodCheque')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} Status</option>
            <option value="PAID">{t('statusPaid')}</option>
            <option value="PENDING">{t('statusPending')}</option>
            <option value="ADVANCE">{t('statusAdvance')}</option>
          </select>

          {(searchTerm || workerFilter !== 'ALL' || methodFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setWorkerFilter('ALL');
                setMethodFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="p-2 text-[#657168] hover:text-[#202A24] hover:bg-[#F7F6EF] rounded-lg"
              title={t('clearFilters')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={payments.length === 0 ? t('emptyPaymentsTitle') : t('noRecordsFound')}
          description={
            payments.length === 0
              ? t('emptyPaymentsDesc')
              : 'Try clearing your search or filter options.'
          }
          actionLabel={payments.length === 0 ? t('actionRecordPayment') : undefined}
          onAction={payments.length === 0 ? () => handleOpenAddModal() : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE4DC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE4DC] bg-[#F7F6EF]/60 text-xs font-semibold text-[#657168]">
                  <th className="py-3 px-4">{t('paymentDate')}</th>
                  <th className="py-3 px-4">{t('workerName')}</th>
                  <th className="py-3 px-4">{t('paymentMethod')}</th>
                  <th className="py-3 px-4">{t('referenceNo')}</th>
                  <th className="py-3 px-4">{t('amount')}</th>
                  <th className="py-3 px-4">{t('paymentStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4DC]/70 text-xs sm:text-sm">
                {filteredPayments.map((payment) => {
                  const worker = workers.find((w) => w.id === payment.workerId);
                  return (
                    <tr key={payment.id} className="hover:bg-[#F7F6EF]/40 transition-colors">
                      <td className="py-3.5 px-4 font-tabular text-xs text-[#202A24]">
                        {formatDate(payment.date)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#202A24]">
                        <div className="font-semibold text-sm">{worker?.name || 'Worker'}</div>
                        <div className="text-xs text-[#657168]">{worker?.role || 'Staff'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#1F5D42]">
                        {payment.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs text-[#657168]">
                        {payment.referenceNo || '—'}
                        {payment.notes && (
                          <span className="block text-[11px] text-[#657168] truncate max-w-xs mt-0.5">
                            {payment.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-sm font-bold text-[#202A24]">
                        {formatCurrency(payment.amount, currency)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusText status={payment.status} type="payment" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(payment)}
                            aria-label="Edit payment"
                            className="p-1.5 text-[#657168] hover:text-[#1F5D42] hover:bg-[#DCE4DC]/50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPaymentToDelete(payment)}
                            aria-label="Delete payment"
                            className="p-1.5 text-[#657168] hover:text-[#C0392B] hover:bg-[#C0392B]/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayment ? t('edit') + ' ' + t('navPayments') : t('actionRecordPayment')}
        subtitle="Disburse wages, record advances, and track transaction vouchers"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('selectWorker')} *
            </label>
            <select
              value={formData.workerId}
              onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
            {formErrors.workerId && (
              <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.workerId}</p>
            )}

            {formData.workerId && (
              <div className="mt-2 p-2 bg-[#F7F6EF] rounded-md text-xs flex items-center justify-between">
                <span className="text-[#657168]">Current balance due to worker:</span>
                <span className="font-bold text-[#202A24] font-tabular">
                  {formatCurrency(selectedWorkerDue, currency)}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('paymentDate')} *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.date && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('amount')} ({currency}) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] font-bold focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.amount && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.amount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('paymentMethod')}
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="CASH">{t('methodCash')}</option>
                <option value="UPI">{t('methodUPI')}</option>
                <option value="BANK_TRANSFER">{t('methodBank')}</option>
                <option value="CHEQUE">{t('methodCheque')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('paymentStatus')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="PAID">{t('statusPaid')}</option>
                <option value="ADVANCE">{t('statusAdvance')}</option>
                <option value="PENDING">{t('statusPending')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('referenceNo')}
            </label>
            <input
              type="text"
              value={formData.referenceNo}
              onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
              placeholder="e.g. UPI txn ref, Cheque #, Cash voucher ID"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Wage settlement remarks, advance repayment terms..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE4DC]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#202A24] bg-white border border-[#DCE4DC] rounded-lg hover:bg-[#F7F6EF] transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs"
            >
              {editingPayment ? t('update') : t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMessage')}
      />
    </div>
  );
};
