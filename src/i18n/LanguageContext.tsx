import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, translations, SUPPORTED_LANGUAGES, LanguageOption } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  availableLanguages: LanguageOption[];
  t: (key: string, defaultText?: string) => string;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  formatDate: (dateStr: string) => string;
  formatNumber: (num: number, decimals?: number) => string;
}

const STORAGE_KEY = 'farm_superintendent_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'ta' || saved === 'hi')) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    const enDict = translations.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    // Final fallback
    return defaultText || key;
  };

  const formatCurrency = (amount: number, currencyCode: string = 'INR'): string => {
    const safeAmount = isNaN(amount) ? 0 : amount;
    const localeMap: Record<SupportedLanguage, string> = {
      en: 'en-IN',
      ta: 'ta-IN',
      hi: 'hi-IN',
    };
    const locale = localeMap[language] || 'en-IN';

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0,
      }).format(safeAmount);
    } catch {
      return `${currencyCode === 'INR' ? '₹' : '$'}${safeAmount.toLocaleString()}`;
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        
        const localeMap: Record<SupportedLanguage, string> = {
          en: 'en-GB',
          ta: 'ta-IN',
          hi: 'hi-IN',
        };
        return d.toLocaleDateString(localeMap[language] || 'en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        availableLanguages: SUPPORTED_LANGUAGES,
        t,
        formatCurrency,
        formatDate,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
