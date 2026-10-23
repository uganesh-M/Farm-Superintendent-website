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
  TreePine,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  farmName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, farmName }) => {
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

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#1F5D42] text-white shrink-0 min-h-screen border-r border-[#16432F]">
      {/* Brand Zone */}
      <div className="px-6 py-5 border-b border-[#16432F]/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#16432F] rounded-lg text-[#E6B84A] border border-[#6FAF78]/30">
            <TreePine className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-bold tracking-tight text-white truncate whitespace-nowrap">
              Farm Superintendent
            </h1>
            <p className="text-xs text-[#6FAF78] truncate">{farmName || 'Estate Management'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold text-[#6FAF78]/80 uppercase tracking-wider">
            {t('farmOperations')}
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E6B84A] ${
                isActive
                  ? 'bg-[#16432F] text-white font-semibold shadow-xs border-l-2 border-[#E6B84A]'
                  : 'text-white/80 hover:bg-[#16432F]/50 hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#E6B84A]' : 'text-[#6FAF78]'
                }`}
              />
              <span className="truncate whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quiet Footer Profile Card */}
      <div className="p-4 border-t border-[#16432F]/80 bg-[#16432F]/40">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/farm_worker_portrait_1792043207895.jpg"
            alt="Farm Superintendent"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border border-[#6FAF78]/40 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Superintendent Admin</p>
            <p className="text-[11px] text-[#6FAF78] truncate">Local Storage Mode (Offline)</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
