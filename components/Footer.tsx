import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../i18n/LanguageContext';

interface FooterProps {
  onOpenRules?: () => void;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRules, className = '' }) => {
  const { t } = useTranslation();

  return (
    <footer className={`w-full py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 ${className}`}>
      {/* Rulebooks quick link if provided */}
      <div className="flex items-center gap-3">
        {onOpenRules && (
          <button
            type="button"
            onClick={onOpenRules}
            className="px-4 py-2 bg-[#FCFAF6] border border-[#D8CFBC] rounded-full text-[#6B5E4F] font-bold text-xs uppercase tracking-wider hover:bg-[#23272E] hover:text-[#FCFAF6] hover:border-[#23272E] active:scale-95 transition-all shadow-xs flex items-center gap-2"
          >
            <i className="fa-solid fa-book-open text-[#C59B27] text-xs"></i>
            <span>{t('home.rulebooksBtn')}</span>
          </button>
        )}
      </div>

      {/* Language Selector in Footer */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#8C7D6B] hidden md:inline">
          {t('common.language')}:
        </span>
        <LanguageSelector />
      </div>
    </footer>
  );
};
