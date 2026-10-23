import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  Droplets,
  Layers,
  Sprout,
  X,
} from 'lucide-react';
import { Field, Crop, SoilType, IrrigationType } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { useLanguage } from '../../i18n/LanguageContext';

interface FieldsViewProps {
  fields: Field[];
  crops: Crop[];
  onSaveField: (field: Field) => void;
  onDeleteField: (id: string) => { success: boolean; error?: string };
  initialModalOpen?: boolean;
}

export const FieldsView: React.FC<FieldsViewProps> = ({
  fields,
  crops,
  onSaveField,
  onDeleteField,
  initialModalOpen = false,
}) => {
  const { t, formatNumber } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen);
  const [editingField, setEditingField] = useState<Field | null>(null);

  const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    size: number;
    unit: 'acres' | 'hectares' | 'cents' | 'sq_ft';
    soilType: SoilType;
    irrigationType: IrrigationType;
    location: string;
    notes: string;
  }>({
    name: '',
    size: 2,
    unit: 'acres',
    soilType: 'Loam',
    irrigationType: 'Drip',
    location: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredFields = useMemo(() => {
    return fields.filter(
      (field) =>
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.soilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (field.location && field.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [fields, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingField(null);
    setFormData({
      name: '',
      size: 2,
      unit: 'acres',
      soilType: 'Loam',
      irrigationType: 'Drip',
      location: '',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (field: Field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      size: field.size,
      unit: field.unit,
      soilType: field.soilType,
      irrigationType: field.irrigationType,
      location: field.location || '',
      notes: field.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Field name is required';
    if (formData.size <= 0) errors.size = 'Field size must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fieldToSave: Field = {
      id: editingField ? editingField.id : `fld-${Date.now()}`,
      name: formData.name.trim(),
      size: Number(formData.size),
      unit: formData.unit,
      soilType: formData.soilType,
      irrigationType: formData.irrigationType,
      location: formData.location.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: editingField ? editingField.createdAt : new Date().toISOString(),
    };

    onSaveField(fieldToSave);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!fieldToDelete) return;
    const res = onDeleteField(fieldToDelete.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete field');
    } else {
      setFieldToDelete(null);
      setDeleteError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202A24] tracking-tight">
            {t('fieldsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#657168] mt-0.5">
            {t('fieldsSubtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs self-start sm:self-auto focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('actionAddField')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#DCE4DC] flex items-center justify-between gap-3">
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
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="p-2 text-[#657168] hover:text-[#202A24] hover:bg-[#F7F6EF] rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {deleteError && (
        <div className="p-3 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-lg text-xs text-[#C0392B] flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fields Grid */}
      {filteredFields.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={fields.length === 0 ? t('emptyFieldsTitle') : t('noRecordsFound')}
          description={
            fields.length === 0
              ? t('emptyFieldsDesc')
              : 'Try searching with a different field name or soil type.'
          }
          actionLabel={fields.length === 0 ? t('actionAddField') : undefined}
          onAction={fields.length === 0 ? handleOpenAddModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFields.map((field) => {
            const activeCropsInField = crops.filter(
              (c) => c.fieldId === field.id && c.status !== 'HARVESTED' && c.status !== 'TERMINATED'
            );

            return (
              <div
                key={field.id}
                className="bg-white rounded-xl border border-[#DCE4DC] p-5 flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[#202A24] tracking-tight">
                        {field.name}
                      </h3>
                      {field.location && (
                        <p className="text-xs text-[#657168] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#1F5D42] shrink-0" />
                          <span className="truncate">{field.location}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(field)}
                        aria-label={`Edit ${field.name}`}
                        className="p-1.5 text-[#657168] hover:text-[#1F5D42] hover:bg-[#DCE4DC]/50 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFieldToDelete(field)}
                        aria-label={`Delete ${field.name}`}
                        className="p-1.5 text-[#657168] hover:text-[#C0392B] hover:bg-[#C0392B]/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DCE4DC] grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#657168] block">{t('fieldSize')}</span>
                      <span className="text-sm font-bold text-[#202A24] font-tabular">
                        {formatNumber(field.size, 1)} {field.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#657168] block">{t('soilType')}</span>
                      <span className="font-semibold text-[#202A24] flex items-center gap-1 mt-0.5">
                        <Layers className="w-3.5 h-3.5 text-[#8B6546]" />
                        <span>{field.soilType}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs">
                    <span className="text-[#657168] block">{t('irrigationType')}</span>
                    <span className="font-semibold text-[#202A24] flex items-center gap-1 mt-0.5">
                      <Droplets className="w-3.5 h-3.5 text-[#2563A6]" />
                      <span>{field.irrigationType}</span>
                    </span>
                  </div>

                  {field.notes && (
                    <p className="mt-3 text-xs text-[#657168] bg-[#F7F6EF]/50 p-2.5 rounded-lg border border-[#DCE4DC]/60 leading-relaxed">
                      {field.notes}
                    </p>
                  )}
                </div>

                {/* Active crops in this field */}
                <div className="mt-4 pt-3 border-t border-[#DCE4DC]">
                  <span className="text-[11px] font-semibold text-[#657168] uppercase tracking-wider block mb-1.5">
                    {t('navCrops')} ({activeCropsInField.length})
                  </span>
                  {activeCropsInField.length === 0 ? (
                    <span className="text-xs text-[#657168] italic">No active crop planted</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {activeCropsInField.map((crop) => (
                        <span
                          key={crop.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-[#1F5D42] bg-[#F7F6EF] border border-[#DCE4DC] rounded-md"
                        >
                          <Sprout className="w-3 h-3 text-[#1F5D42]" />
                          <span>{crop.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Field Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField ? t('edit') + ' ' + t('fieldsTitle') : t('actionAddField')}
        subtitle="Specify land size, irrigation equipment, and soil condition"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('fieldName')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. North Valley Plot, East Orchard"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
            />
            {formErrors.name && (
              <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('fieldSize')} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
              {formErrors.size && (
                <p className="text-[11px] text-[#C0392B] mt-0.5">{formErrors.size}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('areaUnit')}
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="acres">{t('acres')}</option>
                <option value="hectares">{t('hectares')}</option>
                <option value="cents">{t('cents')}</option>
                <option value="sq_ft">{t('sqFt')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('soilType')}
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value as SoilType })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="Loam">{t('soilLoam')}</option>
                <option value="Clay">{t('soilClay')}</option>
                <option value="Sandy">{t('soilSandy')}</option>
                <option value="Silt">{t('soilSilt')}</option>
                <option value="Black">{t('soilBlack')}</option>
                <option value="Red">{t('soilRed')}</option>
                <option value="Alluvial">{t('soilAlluvial')}</option>
                <option value="Other">{t('soilOther')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('irrigationType')}
              </label>
              <select
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value as IrrigationType })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="Drip">{t('irrigDrip')}</option>
                <option value="Sprinkler">{t('irrigSprinkler')}</option>
                <option value="Canal">{t('irrigCanal')}</option>
                <option value="Borewell">{t('irrigBorewell')}</option>
                <option value="Rainfed">{t('irrigRainfed')}</option>
                <option value="Flood">{t('irrigFlood')}</option>
                <option value="None">{t('irrigNone')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              {t('fieldLocation')}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Near pump room, east boundary"
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
              placeholder="Soil condition, slope, fencing details..."
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
              {editingField ? t('update') : t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!fieldToDelete}
        onClose={() => setFieldToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('confirmDeleteTitle')}
        message={
          fieldToDelete
            ? `${t('confirmDeleteMessage')} "${fieldToDelete.name}"`
            : t('confirmDeleteMessage')
        }
      />
    </div>
  );
};
