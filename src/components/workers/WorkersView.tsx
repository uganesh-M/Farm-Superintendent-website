import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  Wallet,
  Clock,
  Eye,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Worker, WorkerRole, WorkerStatus, WorkRecord, Payment } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { StatusText } from '../common/StatusText';
import { useLanguage } from '../../i18n/LanguageContext';

interface WorkersViewProps {
  workers: Worker[];
  workRecords: WorkRecord[];
  payments: Payment[];
  currency: string;
  onSaveWorker: (worker: Worker) => void;
  onDeleteWorker: (id: string) => { success: boolean; error?: string };
  onRecordPaymentForWorker?: (workerId: string) => void;
  initialModalOpen?: boolean;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workers,
  workRecords,
  payments,
  currency,
  onSaveWorker,
  onDeleteWorker,
  onRecordPaymentForWorker,
  initialModalOpen = false,
}) => {
  const { t, formatCurrency, formatDate, formatNumber } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<Worker | null>(null);

  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    role: WorkerRole;
    dailyWage: number;
    status: WorkerStatus;
    joiningDate: string;
    emergencyContact: string;
    notes: string;
  }>({
    name: '',
    phone: '',
    role: 'Field Worker',
    dailyWage: 450,
    status: 'ACTIVE',
    joiningDate: new Date().toISOString().slice(0, 10),
    emergencyContact: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchesSearch =
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phone.includes(searchTerm) ||
        worker.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || worker.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || worker.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [workers, searchTerm, roleFilter, statusFilter]);

  // Compute worker financial summaries
  const getWorkerStats = (workerId: string) => {
    const workerRecords = workRecords.filter((r) => r.workerId === workerId);
    const workerPayments = payments.filter((p) => p.workerId === workerId && p.status === 'PAID');

    const totalEarned = workerRecords.reduce((sum, r) => sum + (Number(r.wageAmount) || 0), 0);
    const totalPaid = workerPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const balance = Math.max(0, totalEarned - totalPaid);
    const totalHours = workerRecords.reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0);

    return {
      recordsCount: workerRecords.length,
      paymentsCount: workerPayments.length,
      totalEarned,
      totalPaid,
      balance,
      totalHours,
      workerRecords,
      workerPayments,
    };
  };

  const handleOpenAddModal = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      phone: '',
      role: 'Field Worker',
      dailyWage: 450,
      status: 'ACTIVE',
      joiningDate: new Date().toISOString().slice(0, 10),
      emergencyContact: '',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone,
      role: worker.role,
      dailyWage: worker.dailyWage,
      status: worker.status,
      joiningDate: worker.joiningDate,
      emergencyContact: worker.emergencyContact || '',
      notes: worker.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Worker name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (formData.dailyWage <= 0) errors.dailyWage = 'Daily wage must be greater than 0';
    if (!formData.joiningDate) errors.joiningDate = 'Joining date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const workerToSave: Worker = {
      id: editingWorker ? editingWorker.id : `wrk-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      dailyWage: Number(formData.dailyWage),
      status: formData.status,
      joiningDate: formData.joiningDate,
      emergencyContact: formData.emergencyContact.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: editingWorker ? editingWorker.createdAt : new Date().toISOString(),
    };

    onSaveWorker(workerToSave);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!workerToDelete) return;
    const res = onDeleteWorker(workerToDelete.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete worker');
    } else {
      setWorkerToDelete(null);
      setDeleteError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202A24] tracking-tight">
            {t('workersTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#657168] mt-0.5">
            {t('workersSubtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs self-start sm:self-auto focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('actionAddWorker')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#DCE4DC] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#657168] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] placeholder-[#657168] focus:outline-hidden focus:border-[#1F5D42] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} Roles</option>
            <option value="Farm Supervisor">Farm Supervisor</option>
            <option value="Field Worker">Field Worker</option>
            <option value="Equipment Operator">Equipment Operator</option>
            <option value="Harvest Specialist">Harvest Specialist</option>
            <option value="General Labor">General Labor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} Status</option>
            <option value="ACTIVE">{t('statusActive')}</option>
            <option value="INACTIVE">{t('statusInactive')}</option>
          </select>

          {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
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

      {deleteError && (
        <div className="p-3 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-lg text-xs text-[#C0392B] flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Workers Table */}
      {filteredWorkers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={workers.length === 0 ? t('emptyWorkersTitle') : t('noRecordsFound')}
          description={
            workers.length === 0
              ? t('emptyWorkersDesc')
              : 'Try adjusting your search criteria or clearing filters.'
          }
          actionLabel={workers.length === 0 ? t('actionAddWorker') : undefined}
          onAction={workers.length === 0 ? handleOpenAddModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE4DC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE4DC] bg-[#F7F6EF]/60 text-xs font-semibold text-[#657168]">
                  <th className="py-3 px-4">{t('workerName')}</th>
                  <th className="py-3 px-4">{t('role')}</th>
                  <th className="py-3 px-4">{t('dailyWage')}</th>
                  <th className="py-3 px-4">{t('totalEarned')}</th>
                  <th className="py-3 px-4">{t('totalPaidAmount')}</th>
                  <th className="py-3 px-4">{t('balanceDue')}</th>
                  <th className="py-3 px-4">{t('workerStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4DC]/70 text-xs sm:text-sm">
                {filteredWorkers.map((worker) => {
                  const stats = getWorkerStats(worker.id);
                  return (
                    <tr key={worker.id} className="hover:bg-[#F7F6EF]/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#202A24]">
                        <div className="font-semibold text-sm">{worker.name}</div>
                        <div className="text-xs text-[#657168] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#1F5D42]" />
                          <span className="font-tabular">{worker.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#657168]">
                        {worker.role}
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs font-bold text-[#202A24]">
                        {formatCurrency(worker.dailyWage, currency)}/day
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs font-medium text-[#202A24]">
                        {formatCurrency(stats.totalEarned, currency)}
                        <span className="block text-[11px] text-[#657168]">
                          {stats.recordsCount} shifts
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs font-medium text-[#2E7D4F]">
                        {formatCurrency(stats.totalPaid, currency)}
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs font-bold">
                        <span className={stats.balance > 0 ? 'text-[#C0392B]' : 'text-[#657168]'}>
                          {formatCurrency(stats.balance, currency)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusText status={worker.status} type="worker" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedWorkerDetail(worker)}
                            title={t('viewDetails')}
                            className="p-1.5 text-[#657168] hover:text-[#1F5D42] hover:bg-[#DCE4DC]/50 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(worker)}
                            title={t('edit')}
                            className="p-1.5 text-[#657168] hover:text-[#1F5D42] hover:bg-[#DCE4DC]/50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setWorkerToDelete(worker)}
                            title={t('delete')}
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

      {/* Worker Detail & Ledger Modal */}
      {selectedWorkerDetail && (
        <Modal
          isOpen={!!selectedWorkerDetail}
          onClose={() => setSelectedWorkerDetail(null)}
          title={`${selectedWorkerDetail.name} — ${t('workHistory')}`}
          subtitle={`${selectedWorkerDetail.role} · Daily Rate: ${formatCurrency(selectedWorkerDetail.dailyWage, currency)}`}
          maxWidth="xl"
        >
          {(() => {
            const stats = getWorkerStats(selectedWorkerDetail.id);
            return (
              <div className="space-y-5">
                {/* Balance & Summary Bar */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-[#F7F6EF] border border-[#DCE4DC] rounded-xl text-center">
                  <div>
                    <span className="text-xs text-[#657168] block">{t('totalEarned')}</span>
                    <span className="text-base font-bold text-[#202A24] font-tabular">
                      {formatCurrency(stats.totalEarned, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#657168] block">{t('totalPaidAmount')}</span>
                    <span className="text-base font-bold text-[#2E7D4F] font-tabular">
                      {formatCurrency(stats.totalPaid, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#657168] block">{t('balanceDue')}</span>
                    <span
                      className={`text-base font-bold font-tabular ${
                        stats.balance > 0 ? 'text-[#C0392B]' : 'text-[#2E7D4F]'
                      }`}
                    >
                      {formatCurrency(stats.balance, currency)}
                    </span>
                  </div>
                </div>

                {/* Worker metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs text-[#657168] pb-2 border-b border-[#DCE4DC]">
                  <p>
                    <span className="font-semibold text-[#202A24]">{t('phone')}:</span>{' '}
                    <span className="font-tabular">{selectedWorkerDetail.phone}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#202A24]">{t('joiningDate')}:</span>{' '}
                    <span className="font-tabular">{formatDate(selectedWorkerDetail.joiningDate)}</span>
                  </p>
                  {selectedWorkerDetail.emergencyContact && (
                    <p className="col-span-2">
                      <span className="font-semibold text-[#202A24]">{t('emergencyContact')}:</span>{' '}
                      {selectedWorkerDetail.emergencyContact}
                    </p>
                  )}
                </div>

                {/* Recent Shift Records */}
                <div>
                  <h4 className="text-xs font-bold text-[#202A24] uppercase tracking-wider mb-2">
                    {t('workHistory')} ({stats.recordsCount})
                  </h4>
                  {stats.workerRecords.length === 0 ? (
                    <p className="text-xs text-[#657168] italic py-2">No work shifts logged.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto divide-y divide-[#DCE4DC] border border-[#DCE4DC] rounded-lg">
                      {stats.workerRecords.map((r) => (
                        <div key={r.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-[#F7F6EF]/40">
                          <div>
                            <span className="font-semibold text-[#202A24]">{r.taskType}</span>
                            <span className="text-[#657168] ml-2">({r.hoursWorked} hrs)</span>
                            <span className="text-[#657168] block">{formatDate(r.date)}</span>
                          </div>
                          <span className="font-bold text-[#202A24] font-tabular">
                            +{formatCurrency(r.wageAmount, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment History */}
                <div>
                  <h4 className="text-xs font-bold text-[#202A24] uppercase tracking-wider mb-2">
                    {t('paymentHistory')} ({stats.paymentsCount})
                  </h4>
                  {stats.workerPayments.length === 0 ? (
                    <p className="text-xs text-[#657168] italic py-2">No payments settled yet.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto divide-y divide-[#DCE4DC] border border-[#DCE4DC] rounded-lg">
                      {stats.workerPayments.map((p) => (
                        <div key={p.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-[#F7F6EF]/40">
                          <div>
                            <span className="font-semibold text-[#2E7D4F]">{p.paymentMethod}</span>
                            {p.referenceNo && (
                              <span className="text-[#657168] ml-2">Ref: {p.referenceNo}</span>
                            )}
                            <span className="text-[#657168] block">{formatDate(p.date)}</span>
                          </div>
                          <span className="font-bold text-[#2E7D4F] font-tabular">
                            -{formatCurrency(p.amount, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#DCE4DC]">
                  {onRecordPaymentForWorker && (
                    <button
                      onClick={() => {
                        const wId = selectedWorkerDetail.id;
                        setSelectedWorkerDetail(null);
                        onRecordPaymentForWorker(wId);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs"
                    >
                      {t('actionRecordPayment')}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedWorkerDetail(null)}
                    className="px-4 py-2 text-xs font-medium text-[#202A24] bg-white border border-[#DCE4DC] rounded-lg hover:bg-[#F7F6EF]"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Add / Edit Worker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorker ? t('edit') + ' ' + t('workersTitle') : t('actionAddWorker')}
        subtitle="Manage farm labor, supervisor profiles, and daily wage structures"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('workerName')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Murugan K., Rajesh Kumar"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
            />
            {formErrors.name && (
              <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('phone')} *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98421 00000"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.phone && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('role')}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as WorkerRole })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="Farm Supervisor">Farm Supervisor</option>
                <option value="Field Worker">Field Worker</option>
                <option value="Equipment Operator">Equipment Operator</option>
                <option value="Harvest Specialist">Harvest Specialist</option>
                <option value="Irrigation Technician">Irrigation Technician</option>
                <option value="General Labor">General Labor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('dailyWage')} ({currency}) *
              </label>
              <input
                type="number"
                min="50"
                value={formData.dailyWage}
                onChange={(e) => setFormData({ ...formData, dailyWage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.dailyWage && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.dailyWage}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('workerStatus')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkerStatus })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="ACTIVE">{t('statusActive')}</option>
                <option value="INACTIVE">{t('statusInactive')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('joiningDate')} *
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('emergencyContact')}
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Name / Relative phone"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Skills, specialties, driving license..."
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
              {editingWorker ? t('update') : t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!workerToDelete}
        onClose={() => setWorkerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('confirmDeleteTitle')}
        message={
          workerToDelete
            ? `${t('confirmDeleteMessage')} "${workerToDelete.name}"`
            : t('confirmDeleteMessage')
        }
      />
    </div>
  );
};
