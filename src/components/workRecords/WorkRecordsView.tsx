import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  User,
  MapPin,
  Sprout,
  X,
  CheckCircle2,
} from 'lucide-react';
import { WorkRecord, Worker, Field, Crop, TaskType, WorkStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { StatusText } from '../common/StatusText';
import { useLanguage } from '../../i18n/LanguageContext';

interface WorkRecordsViewProps {
  workRecords: WorkRecord[];
  workers: Worker[];
  fields: Field[];
  crops: Crop[];
  currency: string;
  onSaveWorkRecord: (record: WorkRecord) => void;
  onDeleteWorkRecord: (id: string) => { success: boolean };
  initialModalOpen?: boolean;
}

export const WorkRecordsView: React.FC<WorkRecordsViewProps> = ({
  workRecords,
  workers,
  fields,
  crops,
  currency,
  onSaveWorkRecord,
  onDeleteWorkRecord,
  initialModalOpen = false,
}) => {
  const { t, formatCurrency, formatDate, formatNumber } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [workerFilter, setWorkerFilter] = useState<string>('ALL');
  const [fieldFilter, setFieldFilter] = useState<string>('ALL');
  const [taskFilter, setTaskFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen);
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);

  const [recordToDelete, setRecordToDelete] = useState<WorkRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    date: string;
    workerId: string;
    fieldId: string;
    cropId: string;
    taskType: TaskType;
    hoursWorked: number;
    dailyRateApplied: number;
    wageAmount: number;
    status: WorkStatus;
    notes: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    workerId: workers[0]?.id || '',
    fieldId: fields[0]?.id || '',
    cropId: '',
    taskType: 'Weeding',
    hoursWorked: 8,
    dailyRateApplied: workers[0]?.dailyWage || 450,
    wageAmount: workers[0]?.dailyWage || 450,
    status: 'COMPLETED',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredRecords = useMemo(() => {
    return workRecords.filter((record) => {
      const worker = workers.find((w) => w.id === record.workerId);
      const field = fields.find((f) => f.id === record.fieldId);
      const crop = crops.find((c) => c.id === record.cropId);

      const matchesSearch =
        record.taskType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (worker && worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (field && field.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (crop && crop.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesWorker = workerFilter === 'ALL' || record.workerId === workerFilter;
      const matchesField = fieldFilter === 'ALL' || record.fieldId === fieldFilter;
      const matchesTask = taskFilter === 'ALL' || record.taskType === taskFilter;

      return matchesSearch && matchesWorker && matchesField && matchesTask;
    });
  }, [workRecords, workers, fields, crops, searchTerm, workerFilter, fieldFilter, taskFilter]);

  const handleOpenAddModal = () => {
    const defaultWorker = workers[0];
    const defaultRate = defaultWorker ? defaultWorker.dailyWage : 450;
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      workerId: defaultWorker ? defaultWorker.id : '',
      fieldId: fields[0] ? fields[0].id : '',
      cropId: '',
      taskType: 'Weeding',
      hoursWorked: 8,
      dailyRateApplied: defaultRate,
      wageAmount: defaultRate,
      status: 'COMPLETED',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: WorkRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      workerId: record.workerId,
      fieldId: record.fieldId,
      cropId: record.cropId || '',
      taskType: record.taskType,
      hoursWorked: record.hoursWorked,
      dailyRateApplied: record.dailyRateApplied,
      wageAmount: record.wageAmount,
      status: record.status,
      notes: record.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // When worker changes in modal, auto-update default daily rate
  const handleWorkerChange = (workerId: string) => {
    const selected = workers.find((w) => w.id === workerId);
    const rate = selected ? selected.dailyWage : formData.dailyRateApplied;
    const computedWage = Math.round((rate * (formData.hoursWorked / 8)) * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      workerId,
      dailyRateApplied: rate,
      wageAmount: computedWage,
    }));
  };

  // When hours worked changes, recalculate wage
  const handleHoursChange = (hours: number) => {
    const computedWage = Math.round((formData.dailyRateApplied * (hours / 8)) * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      hoursWorked: hours,
      wageAmount: computedWage,
    }));
  };

  // When daily rate changes, recalculate wage
  const handleRateChange = (rate: number) => {
    const computedWage = Math.round((rate * (formData.hoursWorked / 8)) * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      dailyRateApplied: rate,
      wageAmount: computedWage,
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.workerId) errors.workerId = 'Worker selection is required';
    if (!formData.fieldId) errors.fieldId = 'Field selection is required';
    if (!formData.date) errors.date = 'Date is required';
    if (formData.hoursWorked <= 0) errors.hoursWorked = 'Hours must be greater than 0';
    if (formData.wageAmount < 0) errors.wageAmount = 'Wage cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const recordToSave: WorkRecord = {
      id: editingRecord ? editingRecord.id : `rec-${Date.now()}`,
      date: formData.date,
      workerId: formData.workerId,
      fieldId: formData.fieldId,
      cropId: formData.cropId ? formData.cropId : undefined,
      taskType: formData.taskType,
      hoursWorked: Number(formData.hoursWorked),
      dailyRateApplied: Number(formData.dailyRateApplied),
      wageAmount: Number(formData.wageAmount),
      status: formData.status,
      notes: formData.notes.trim() || undefined,
      createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString(),
    };

    onSaveWorkRecord(recordToSave);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!recordToDelete) return;
    onDeleteWorkRecord(recordToDelete.id);
    setRecordToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202A24] tracking-tight">
            {t('workRecordsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#657168] mt-0.5">
            {t('workRecordsSubtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs self-start sm:self-auto focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('actionLogWork')}</span>
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
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} {t('fieldsTitle')}</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} Tasks</option>
            <option value="Weeding">Weeding</option>
            <option value="Irrigation">Irrigation</option>
            <option value="Harvesting">Harvesting</option>
            <option value="Spraying">Spraying</option>
            <option value="Fertilizing">Fertilizing</option>
            <option value="Tilling">Tilling</option>
            <option value="Pruning">Pruning</option>
            <option value="General Maintenance">General Maintenance</option>
          </select>

          {(searchTerm || workerFilter !== 'ALL' || fieldFilter !== 'ALL' || taskFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setWorkerFilter('ALL');
                setFieldFilter('ALL');
                setTaskFilter('ALL');
              }}
              className="p-2 text-[#657168] hover:text-[#202A24] hover:bg-[#F7F6EF] rounded-lg"
              title={t('clearFilters')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table of Records */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={workRecords.length === 0 ? t('emptyWorkRecordsTitle') : t('noRecordsFound')}
          description={
            workRecords.length === 0
              ? t('emptyWorkRecordsDesc')
              : 'Try clearing your search or filter options.'
          }
          actionLabel={workRecords.length === 0 ? t('actionLogWork') : undefined}
          onAction={workRecords.length === 0 ? handleOpenAddModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE4DC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE4DC] bg-[#F7F6EF]/60 text-xs font-semibold text-[#657168]">
                  <th className="py-3 px-4">{t('date')}</th>
                  <th className="py-3 px-4">{t('workerName')}</th>
                  <th className="py-3 px-4">{t('taskType')}</th>
                  <th className="py-3 px-4">{t('assignedField')} & {t('navCrops')}</th>
                  <th className="py-3 px-4">{t('hoursWorked')}</th>
                  <th className="py-3 px-4">{t('calculatedWage')}</th>
                  <th className="py-3 px-4">{t('workStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4DC]/70 text-xs sm:text-sm">
                {filteredRecords.map((record) => {
                  const worker = workers.find((w) => w.id === record.workerId);
                  const field = fields.find((f) => f.id === record.fieldId);
                  const crop = crops.find((c) => c.id === record.cropId);

                  return (
                    <tr key={record.id} className="hover:bg-[#F7F6EF]/40 transition-colors">
                      <td className="py-3.5 px-4 font-tabular text-xs text-[#202A24]">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#202A24]">
                        <div className="font-semibold text-sm">{worker?.name || 'Worker'}</div>
                        <div className="text-xs text-[#657168]">{worker?.role || 'Staff'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#1F5D42]">
                        {record.taskType}
                        {record.notes && (
                          <p className="text-[11px] text-[#657168] font-normal truncate max-w-xs mt-0.5">
                            {record.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#657168]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#1F5D42]" />
                          <span className="font-medium text-[#202A24]">{field?.name || 'Field'}</span>
                        </div>
                        {crop && (
                          <div className="flex items-center gap-1 text-[11px] text-[#6FAF78] mt-0.5">
                            <Sprout className="w-3 h-3" />
                            <span>{crop.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs text-[#657168]">
                        {record.hoursWorked} hrs
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs font-bold text-[#202A24]">
                        {formatCurrency(record.wageAmount, currency)}
                        <span className="block text-[10px] text-[#657168] font-normal">
                          @{formatCurrency(record.dailyRateApplied, currency)}/day
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusText status={record.status} type="work" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(record)}
                            aria-label="Edit record"
                            className="p-1.5 text-[#657168] hover:text-[#1F5D42] hover:bg-[#DCE4DC]/50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(record)}
                            aria-label="Delete record"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? t('edit') + ' ' + t('navWorkRecords') : t('actionLogWork')}
        subtitle="Log farm labor task, field plot, hours, and wage liability"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('date')} *
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
                {t('selectWorker')} *
              </label>
              <select
                value={formData.workerId}
                onChange={(e) => handleWorkerChange(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role} - {formatCurrency(w.dailyWage, currency)})
                  </option>
                ))}
              </select>
              {formErrors.workerId && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.workerId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('assignedField')} *
              </label>
              <select
                value={formData.fieldId}
                onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              {formErrors.fieldId && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.fieldId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('selectCropOptional')}
              </label>
              <select
                value={formData.cropId}
                onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="">None / General Field Work</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.variety})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('taskType')}
              </label>
              <select
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value as TaskType })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="Sowing">{t('taskSowing')}</option>
                <option value="Weeding">{t('taskWeeding')}</option>
                <option value="Spraying">{t('taskSpraying')}</option>
                <option value="Pruning">{t('taskPruning')}</option>
                <option value="Irrigation">{t('taskIrrigation')}</option>
                <option value="Fertilizing">{t('taskFertilizing')}</option>
                <option value="Harvesting">{t('taskHarvesting')}</option>
                <option value="Tilling">{t('taskTilling')}</option>
                <option value="Packing">{t('taskPacking')}</option>
                <option value="General Maintenance">{t('taskMaintenance')}</option>
                <option value="Other">{t('taskOther')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('workStatus')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkStatus })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="COMPLETED">{t('statusCompleted')}</option>
                <option value="IN_PROGRESS">{t('statusInProgress')}</option>
                <option value="VERIFIED">{t('statusVerified')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F7F6EF] rounded-lg border border-[#DCE4DC]">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('hoursWorked')}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={formData.hoursWorked}
                onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('rateApplied')} ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={formData.dailyRateApplied}
                onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('calculatedWage')} ({currency}) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.wageAmount}
                onChange={(e) => setFormData({ ...formData, wageAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] font-bold"
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
              placeholder="Row numbers, yield crates picked, equipment used..."
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
              {editingRecord ? t('update') : t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMessage')}
      />
    </div>
  );
};
