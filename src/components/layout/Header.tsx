import React, { useState, useRef, useEffect } from 'react';
import { Globe, Menu, ChevronDown, Check, Plus, TreePine } from 'lucide-react';
import { ActiveTab, SupportedLanguage } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onQuickAction?: () => void;
  currency: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onQuickAction,
  currency,
}) => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabTitle = (tab: ActiveTab): string => {
    switch (tab) {
      case 'dashboard':
        return t('navDashboard');
      case 'crops':
        return t('navCrops');
      case 'fields':
        return t('navFields');
      case 'workers':
        return t('navWorkers');
      case 'work-records':
        return t('navWorkRecords');
      case 'payments':
        return t('navPayments');
      case 'expenses':
        return t('navExpenses');
      case 'reports':
        return t('navReports');
      case 'settings':
        return t('navSettings');
      default:
        return 'Farm Superintendent';
    }
  };

  const currentLangObj = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-white border-b border-[#DCE4DC] shadow-2xs">
      {/* Zone 1: Mobile brand / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 text-[#202A24] hover:bg-[#F7F6EF] rounded-lg transition-colors border border-[#DCE4DC]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="lg:hidden p-1.5 bg-[#1F5D42] text-[#E6B84A] rounded-md">
            <TreePine className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-bold text-[#202A24] tracking-tight whitespace-nowrap">
              {getTabTitle(activeTab)}
            </h2>
          </div>
        </div>
      </div>

      {/* Zone 3: Language Selector + Currency Indicator + Quick Action */}
      <div className="flex items-center gap-3">
        {/* Currency badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1F5D42] bg-[#F7F6EF] border border-[#DCE4DC] rounded-lg">
          <span className="text-[#657168] font-normal">Currency:</span>
          <span>{currency}</span>
        </div>

        {/* Multilingual Selector Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-expanded={langMenuOpen}
            aria-label="Select language"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#202A24] bg-white border border-[#DCE4DC] rounded-lg hover:bg-[#F7F6EF] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
          >
            <Globe className="w-4 h-4 text-[#1F5D42]" />
            <span className="font-semibold">{currentLangObj.nativeLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#657168]" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#DCE4DC] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in-50 duration-150">
              <div className="px-3 py-1 border-b border-[#DCE4DC]/60 mb-1">
                <span className="text-[11px] font-semibold text-[#657168] uppercase tracking-wider">
                  Select Language / மொழி
                </span>
              </div>
              {availableLanguages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as SupportedLanguage);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-[#F7F6EF] text-[#1F5D42] font-semibold'
                        : 'text-[#202A24] hover:bg-[#F7F6EF]'
                    }`}
                  >
                    <div>
                      <p>{lang.nativeLabel}</p>
                      <p className="text-[10px] text-[#657168]">{lang.label}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1F5D42]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Primary Quick Action Button */}
        {onQuickAction && (
          <button
            onClick={onQuickAction}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1F5D42] rounded-lg hover:bg-[#16432F] transition-colors shadow-2xs whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F5D42]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('actionLogWork')}</span>
          </button>
        )}
      </div>
    </header>
  );
};
