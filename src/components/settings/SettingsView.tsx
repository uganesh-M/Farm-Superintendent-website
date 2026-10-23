import React, { useState, useRef } from 'react';
import {
  Settings,
  Globe,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { FarmSettings, SupportedLanguage } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useLanguage } from '../../i18n/LanguageContext';

interface SettingsViewProps {
  settings: FarmSettings;
  onSaveSettings: (settings: FarmSettings) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => { success: boolean; message: string };
  onResetToDemo: () => void;
  onClearAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetToDemo,
  onClearAll,
}) => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FarmSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = onImportData(content);
        setImportStatus(result);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#202A24] tracking-tight">
          {t('settingsTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[#657168] mt-0.5">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Language Preference Section */}
      <div className="p-6 bg-white rounded-xl border border-[#DCE4DC]">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#DCE4DC]">
          <div className="p-2 bg-[#F7F6EF] text-[#1F5D42] rounded-lg">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202A24]">
              {t('languageLabel')} / இடைமுக மொழி / भाषा
            </h3>
            <p className="text-xs text-[#657168]">
              Switch interface translations instantly across all farm operations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {availableLanguages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code as SupportedLanguage)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#1F5D42] bg-[#F7F6EF] ring-2 ring-[#1F5D42]/20'
                    : 'border-[#DCE4DC] bg-white hover:border-[#1F5D42]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#202A24]">{lang.nativeLabel}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1F5D42]" />}
                </div>
                <span className="text-xs text-[#657168] block mt-1">{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Farm Profile Form */}
      <div className="p-6 bg-white rounded-xl border border-[#DCE4DC]">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#DCE4DC]">
          <div className="p-2 bg-[#F7F6EF] text-[#1F5D42] rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202A24]">{t('farmProfile')}</h3>
            <p className="text-xs text-[#657168]">
              Estate branding, default measurement units, and currency
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('farmNameLabel')} *
              </label>
              <input
                type="text"
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('ownerNameLabel')} *
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A24] mb-1">
              Farm Location & District
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                {t('currencyLabel')}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A24] mb-1">
                Default Area Unit
              </label>
              <select
                value={formData.defaultAreaUnit}
                onChange={(e) => setFormData({ ...formData, defaultAreaUnit: e.target.value as any })}
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
                {t('standardHoursLabel')}
              </label>
              <input
                type="number"
                min="4"
                max="16"
                value={formData.standardWorkHours}
                onChange={(e) => setFormData({ ...formData, standardWorkHours: parseInt(e.target.value, 10) || 8 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCE4DC] rounded-lg text-[#202A24] focus:outline-hidden focus:border-[#1F5D42]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#DCE4DC]">
            {saveSuccess ? (
              <span className="text-xs text-[#2E7D4F] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully
              </span>
            ) : (
              <div />
            )}
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1F5D42] hover:bg-[#16432F] rounded-lg transition-colors shadow-2xs"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>

      {/* Database Storage & Backup Management */}
      <div className="p-6 bg-white rounded-xl border border-[#DCE4DC]">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#DCE4DC]">
          <div className="p-2 bg-[#F7F6EF] text-[#8B6546] rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202A24]">{t('dataManagement')}</h3>
            <p className="text-xs text-[#657168]">{t('dataManagementDesc')}</p>
          </div>
        </div>

        {importStatus && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-[#2E7D4F]/10 text-[#2E7D4F] border border-[#2E7D4F]/30'
                : 'bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/30'
            }`}
          >
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <button
            type="button"
            onClick={onExportData}
            className="flex items-center gap-3 p-4 rounded-xl border border-[#DCE4DC] bg-white hover:bg-[#F7F6EF] transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-[#1F5D42]/10 text-[#1F5D42]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#202A24] block">
                {t('backupExport')}
              </span>
              <span className="text-xs text-[#657168]">
                Download full JSON snapshot of all fields, crops, labor, and payments
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-4 rounded-xl border border-[#DCE4DC] bg-white hover:bg-[#F7F6EF] transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-[#2563A6]/10 text-[#2563A6]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#202A24] block">
                {t('restoreImport')}
              </span>
              <span className="text-xs text-[#657168]">
                Restore farm database from a previously saved JSON backup
              </span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-3 p-4 rounded-xl border border-[#DCE4DC] bg-white hover:bg-[#F7F6EF] transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-[#6FAF78]/10 text-[#1F5D42]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#202A24] block">
                {t('loadDemoData')}
              </span>
              <span className="text-xs text-[#657168]">
                Populate realistic sample crops, fields, workers, and payment logs
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="flex items-center gap-3 p-4 rounded-xl border border-[#C0392B]/20 bg-white hover:bg-[#C0392B]/5 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-[#C0392B]/10 text-[#C0392B]">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#C0392B] block">
                {t('clearAllData')}
              </span>
              <span className="text-xs text-[#657168]">
                Permanently purge all stored records to start completely fresh
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Confirm Reset to Demo Dialog */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={onResetToDemo}
        title="Load Sample Farm Records"
        message="This will replace current farm records with sample data (crops, plots, workers, daily tasks, and payment history). Continue?"
        confirmLabel="Load Sample Data"
        isDestructive={false}
      />

      {/* Confirm Clear All Dialog */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={onClearAll}
        title={t('confirmDeleteTitle')}
        message={t('confirmClearData')}
        confirmLabel={t('clearAllData')}
        isDestructive={true}
      />
    </div>
  );
};
