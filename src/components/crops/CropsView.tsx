import React, { useState, useMemo } from 'react';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  TrendingUp,
  X,
} from 'lucide-react';
import { Crop, CropStatus, Field } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { StatusText } from '../common/StatusText';
import { useLanguage } from '../../i18n/LanguageContext';

interface CropsViewProps {
  crops: Crop[];
  fields: Field[];
  onSaveCrop: (crop: Crop) => void;
  onDeleteCrop: (id: string) => { success: boolean; error?: string };
  initialModalOpen?: boolean;
}

export const CropsView: React.FC<CropsViewProps> = ({
  crops,
  fields,
  onSaveCrop,
  onDeleteCrop,
  initialModalOpen = false,
}) => {
  const { t, formatDate, formatNumber } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fieldFilter, setFieldFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  const [cropToDelete, setCropToDelete] = useState<Crop | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    variety: string;
    fieldId: string;
    plantingDate: string;
    expectedHarvestDate: string;
    actualHarvestDate: string;
    areaPlanted: number;
    areaUnit: 'acres' | 'hectares' | 'cents' | 'sq_ft';
    expectedYield: string;
    status: CropStatus;
    notes: string;
  }>({
    name: '',
    variety: '',
    fieldId: fields[0]?.id || '',
    plantingDate: new Date().toISOString().slice(0, 10),
    expectedHarvestDate: '',
    actualHarvestDate: '',
    areaPlanted: 1,
    areaUnit: 'acres',
    expectedYield: '',
    status: 'GROWING',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const field = fields.find((f) => f.id === crop.fieldId);
      const matchesSearch =
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (field && field.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || crop.status === statusFilter;
      const matchesField = fieldFilter === 'ALL' || crop.fieldId === fieldFilter;

      return matchesSearch && matchesStatus && matchesField;
    });
  }, [crops, fields, searchTerm, statusFilter, fieldFilter]);

  const handleOpenAddModal = () => {
    setEditingCrop(null);
    setFormData({
      name: '',
      variety: '',
      fieldId: fields[0]?.id || '',
      plantingDate: new Date().toISOString().slice(0, 10),
      expectedHarvestDate: '',
      actualHarvestDate: '',
      areaPlanted: 1,
      areaUnit: 'acres',
      expectedYield: '',
      status: 'GROWING',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (crop: Crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      variety: crop.variety,
      fieldId: crop.fieldId,
      plantingDate: crop.plantingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      actualHarvestDate: crop.actualHarvestDate || '',
      areaPlanted: crop.areaPlanted,
      areaUnit: crop.areaUnit,
      expectedYield: crop.expectedYield || '',
      status: crop.status,
      notes: crop.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Crop name is required';
    if (!formData.variety.trim()) errors.variety = 'Variety is required';
    if (!formData.fieldId) errors.fieldId = 'Field selection is required';
    if (!formData.plantingDate) errors.plantingDate = 'Planting date is required';
    if (!formData.expectedHarvestDate) errors.expectedHarvestDate = 'Expected harvest date is required';
    if (formData.areaPlanted <= 0) errors.areaPlanted = 'Area must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cropToSave: Crop = {
      id: editingCrop ? editingCrop.id : `crp-${Date.now()}`,
      name: formData.name.trim(),
      variety: formData.variety.trim(),
      fieldId: formData.fieldId,
      plantingDate: formData.plantingDate,
      expectedHarvestDate: formData.expectedHarvestDate,
      actualHarvestDate: formData.actualHarvestDate ? formData.actualHarvestDate : undefined,
      areaPlanted: Number(formData.areaPlanted),
      areaUnit: formData.areaUnit,
      expectedYield: formData.expectedYield.trim() || undefined,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
      createdAt: editingCrop ? editingCrop.createdAt : new Date().toISOString(),
    };

    onSaveCrop(cropToSave);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!cropToDelete) return;
    const res = onDeleteCrop(cropToDelete.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete crop');
    } else {
      setCropToDelete(null);
      setDeleteError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202A24] tracking-tight">
            {t('cropsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#657168] mt-0.5">
            {t('cropsSubtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs self-start sm:self-auto focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('actionAddCrop')}</span>
        </button>
      </div>

      {/* Filter Bar */}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F7F6EF]/50 border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
          >
            <option value="ALL">{t('all')} {t('status')}</option>
            <option value="PLANNED">{t('statusPlanned')}</option>
            <option value="GROWING">{t('statusGrowing')}</option>
            <option value="READY_FOR_HARVEST">{t('statusReadyForHarvest')}</option>
            <option value="HARVESTED">{t('statusHarvested')}</option>
            <option value="TERMINATED">{t('statusTerminated')}</option>
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

          {(searchTerm || statusFilter !== 'ALL' || fieldFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setFieldFilter('ALL');
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

      {/* Crops Table / Cards */}
      {filteredCrops.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title={crops.length === 0 ? t('emptyCropsTitle') : t('noRecordsFound')}
          description={
            crops.length === 0
              ? t('emptyCropsDesc')
              : 'Try adjusting your search criteria or clearing filters.'
          }
          actionLabel={crops.length === 0 ? t('actionAddCrop') : undefined}
          onAction={crops.length === 0 ? handleOpenAddModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE4DC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE4DC] bg-[#F7F6EF]/60 text-xs font-semibold text-[#657168]">
                  <th className="py-3 px-4">{t('cropName')} & {t('variety')}</th>
                  <th className="py-3 px-4">{t('assignedField')}</th>
                  <th className="py-3 px-4">{t('plantingDate')}</th>
                  <th className="py-3 px-4">{t('expectedHarvest')}</th>
                  <th className="py-3 px-4">{t('plantedArea')}</th>
                  <th className="py-3 px-4">{t('cropStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4DC]/70 text-xs sm:text-sm">
                {filteredCrops.map((crop) => {
                  const field = fields.find((f) => f.id === crop.fieldId);
                  return (
                    <tr key={crop.id} className="hover:bg-[#F7F6EF]/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#202A24]">
                        <div className="font-semibold text-sm">{crop.name}</div>
                        <div className="text-xs text-[#657168]">{crop.variety}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#202A24]">
                        <div className="flex items-center gap-1.5 text-xs text-[#657168]">
                          <MapPin className="w-3.5 h-3.5 text-[#1F5D42]" />
                          <span>{field?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs text-[#657168]">
                        {formatDate(crop.plantingDate)}
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs text-[#657168]">
                        {formatDate(crop.expectedHarvestDate)}
                      </td>
                      <td className="py-3.5 px-4 font-tabular text-xs text-[#202A24]">
                        {formatNumber(crop.areaPlanted, 1)} {crop.areaUnit}
                        {crop.expectedYield && (
                          <div className="text-[11px] text-[#657168]">
                            Est. {crop.expectedYield}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusText status={crop.status} type="crop" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(crop)}
                            aria-label={`Edit ${crop.name}`}
                            className="p-1.5 text-[#657168] hover:text-[#1F5D42] hover:bg-[#DCE4DC]/50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCropToDelete(crop)}
                            aria-label={`Delete ${crop.name}`}
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

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCrop ? t('edit') + ' ' + t('cropsTitle') : t('actionAddCrop')}
        subtitle="Manage crop variety, planting schedule, and plot allocation"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('cropName')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tomatoes, Basmati Rice"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.name && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('variety')} *
              </label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                placeholder="e.g. Hybrid Roma, PB-1121"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.variety && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.variety}</p>
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
                {fields.length === 0 ? (
                  <option value="">No fields available</option>
                ) : (
                  fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.size} {f.unit})
                    </option>
                  ))
                )}
              </select>
              {formErrors.fieldId && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.fieldId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('cropStatus')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CropStatus })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="PLANNED">{t('statusPlanned')}</option>
                <option value="GROWING">{t('statusGrowing')}</option>
                <option value="READY_FOR_HARVEST">{t('statusReadyForHarvest')}</option>
                <option value="HARVESTED">{t('statusHarvested')}</option>
                <option value="TERMINATED">{t('statusTerminated')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('plantingDate')} *
              </label>
              <input
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.plantingDate && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.plantingDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('expectedHarvest')} *
              </label>
              <input
                type="date"
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.expectedHarvestDate && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.expectedHarvestDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('plantedArea')} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.areaPlanted}
                onChange={(e) => setFormData({ ...formData, areaPlanted: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('areaUnit')}
              </label>
              <select
                value={formData.areaUnit}
                onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value as any })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="acres">{t('acres')}</option>
                <option value="hectares">{t('hectares')}</option>
                <option value="cents">{t('cents')}</option>
                <option value="sq_ft">{t('sqFt')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('expectedYield')}
              </label>
              <input
                type="text"
                value={formData.expectedYield}
                onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                placeholder="e.g. 15 Tons"
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
              placeholder="Irrigation schedule, fertilizer notes, pest control remarks..."
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
              {editingCrop ? t('update') : t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cropToDelete}
        onClose={() => setCropToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('confirmDeleteTitle')}
        message={
          cropToDelete
            ? `${t('confirmDeleteMessage')} "${cropToDelete.name}" (${cropToDelete.variety})`
            : t('confirmDeleteMessage')
        }
      />
    </div>
  );
};
