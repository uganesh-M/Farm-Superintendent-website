import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  MapPin,
  Users,
  ClipboardList,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  X,
  TreePine,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  farmName: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  farmName,
}) => {
  const { t } = useLanguage();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'crops', label: t('navCrops'), icon: Sprout },
    { id: 'fields', label: t('navFields'), icon: MapPin },
    { id: 'workers', label: t('navWorkers'), icon: Users },
    { id: 'work-records', label: t('navWorkRecords'), icon: ClipboardList },
    { id: 'payments', label: t('navPayments'), icon: Wallet },
    { id: 'expenses', label: t('navExpenses'), icon: Receipt },
    { id: 'reports', label: t('navReports'), icon: BarChart3 },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#202A24]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-[#1F5D42] text-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#16432F]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#16432F] text-[#E6B84A] rounded-md">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Farm Superintendent</h2>
              <p className="text-[11px] text-[#6FAF78] truncate">{farmName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-[#16432F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#16432F] text-white font-semibold border-l-2 border-[#E6B84A]'
                    : 'text-white/80 hover:bg-[#16432F]/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#E6B84A]' : 'text-[#6FAF78]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#16432F] bg-[#16432F]/50">
          <p className="text-xs text-[#6FAF78] font-medium">Farm Superintendent v1.0</p>
          <p className="text-[11px] text-white/60">Offline-first farm management</p>
        </div>
      </div>
    </div>
  );
};
