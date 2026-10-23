import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { useLanguage } from '../../i18n/LanguageContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  isDestructive = true,
}) => {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-lg shrink-0 ${
            isDestructive ? 'bg-[#C0392B]/10 text-[#C0392B]' : 'bg-[#B7791F]/10 text-[#B7791F]'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-[#657168] leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE4DC] mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-[#202A24] bg-white border border-[#DCE4DC] rounded-lg hover:bg-[#F7F6EF] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
        >
          {t('cancel')}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-hidden focus-visible:ring-2 ${
            isDestructive
              ? 'bg-[#C0392B] hover:bg-[#A93226] focus-visible:ring-[#C0392B]'
              : 'bg-[#1F5D42] hover:bg-[#16432F] focus-visible:ring-[#1F5D42]'
          }`}
        >
          {confirmLabel || t('confirm')}
        </button>
      </div>
    </Modal>
  );
};
