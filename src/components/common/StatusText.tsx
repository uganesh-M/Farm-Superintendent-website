import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface StatusTextProps {
  status: string;
  type?: 'crop' | 'worker' | 'work' | 'payment';
}

export const StatusText: React.FC<StatusTextProps> = ({ status, type = 'crop' }) => {
  const { t } = useLanguage();

  let label = status;
  let colorClass = 'text-[#657168]'; // Default muted

  if (type === 'crop') {
    switch (status) {
      case 'PLANNED':
        label = t('statusPlanned');
        colorClass = 'text-[#2563A6] font-medium';
        break;
      case 'GROWING':
        label = t('statusGrowing');
        colorClass = 'text-[#2E7D4F] font-medium';
        break;
      case 'READY_FOR_HARVEST':
        label = t('statusReadyForHarvest');
        colorClass = 'text-[#B7791F] font-semibold';
        break;
      case 'HARVESTED':
        label = t('statusHarvested');
        colorClass = 'text-[#1F5D42] font-medium';
        break;
      case 'TERMINATED':
        label = t('statusTerminated');
        colorClass = 'text-[#C0392B] font-medium';
        break;
    }
  } else if (type === 'worker') {
    switch (status) {
      case 'ACTIVE':
        label = t('statusActive');
        colorClass = 'text-[#2E7D4F] font-medium';
        break;
      case 'INACTIVE':
        label = t('statusInactive');
        colorClass = 'text-[#657168] font-medium';
        break;
    }
  } else if (type === 'work') {
    switch (status) {
      case 'COMPLETED':
        label = t('statusCompleted');
        colorClass = 'text-[#2E7D4F] font-medium';
        break;
      case 'IN_PROGRESS':
        label = t('statusInProgress');
        colorClass = 'text-[#2563A6] font-medium';
        break;
      case 'VERIFIED':
        label = t('statusVerified');
        colorClass = 'text-[#1F5D42] font-semibold';
        break;
    }
  } else if (type === 'payment') {
    switch (status) {
      case 'PAID':
        label = t('statusPaid');
        colorClass = 'text-[#2E7D4F] font-medium';
        break;
      case 'PENDING':
        label = t('statusPending');
        colorClass = 'text-[#C0392B] font-semibold';
        break;
      case 'ADVANCE':
        label = t('statusAdvance');
        colorClass = 'text-[#B7791F] font-medium';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${colorClass}`}>
      <span aria-hidden="true" className="text-xs">●</span>
      <span>{label}</span>
    </span>
  );
};
