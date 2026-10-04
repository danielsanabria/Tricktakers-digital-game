import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const FlagUK: React.FC<{ className?: string }> = ({ className = 'w-5 h-3.5' }) => (
  <svg viewBox="0 0 60 30" className={`${className} rounded-xs shadow-xs object-cover overflow-hidden inline-block`} xmlns="http://www.w3.org/2000/svg">
    <clipPath id="uk-clip">
      <rect width="60" height="30" rx="2" />
    </clipPath>
    <g clipPath="url(#uk-clip)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30" stroke="#C8102E" strokeWidth="2" strokeDasharray="30" strokeDashoffset="0" />
      <path d="M60,0 L0,30" stroke="#C8102E" strokeWidth="2" strokeDasharray="30" strokeDashoffset="0" />
      <path d="M0,0 L30,15" stroke="#C8102E" strokeWidth="2" />
      <path d="M60,30 L30,15" stroke="#C8102E" strokeWidth="2" />
      <path d="M60,0 L30,15" stroke="#C8102E" strokeWidth="2" />
      <path d="M0,30 L30,15" stroke="#C8102E" strokeWidth="2" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

export const FlagSpain: React.FC<{ className?: string }> = ({ className = 'w-5 h-3.5' }) => (
  <svg viewBox="0 0 60 30" className={`${className} rounded-xs shadow-xs object-cover overflow-hidden inline-block`} xmlns="http://www.w3.org/2000/svg">
    <clipPath id="es-clip">
      <rect width="60" height="30" rx="2" />
    </clipPath>
    <g clipPath="url(#es-clip)">
      <rect width="60" height="30" fill="#AA151B" />
      <rect y="7.5" width="60" height="15" fill="#F1BF00" />
      {/* Emblem accent dot/shield */}
      <circle cx="16" cy="15" r="3.5" fill="#AA151B" opacity="0.85" />
      <circle cx="16" cy="14" r="1.5" fill="#F1BF00" />
    </g>
  </svg>
);

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 bg-[#FCFAF6] border-2 border-[#D8CFBC] rounded-full shadow-sm backdrop-blur-sm transition-all hover:border-[#C59B27]`}
      role="group"
      aria-label="Language selection"
    >
      {/* English button */}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer ${
          language === 'en'
            ? 'bg-[#23272E] text-[#FCFAF6] shadow-sm border border-[#3E4550]'
            : 'text-[#6B5E4F] hover:bg-[#F4EEDF] hover:text-[#23272E]'
        }`}
        title="Switch to English"
      >
        <FlagUK className="w-4 h-3 rounded-xs shrink-0" />
        <span className={compact ? 'hidden sm:inline font-bold' : 'font-bold'}>EN</span>
      </button>

      {/* Spanish button */}
      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer ${
          language === 'es'
            ? 'bg-[#23272E] text-[#FCFAF6] shadow-sm border border-[#3E4550]'
            : 'text-[#6B5E4F] hover:bg-[#F4EEDF] hover:text-[#23272E]'
        }`}
        title="Cambiar a Español"
      >
        <FlagSpain className="w-4 h-3 rounded-xs shrink-0" />
        <span className={compact ? 'hidden sm:inline font-bold' : 'font-bold'}>ES</span>
      </button>
    </div>
  );
};
