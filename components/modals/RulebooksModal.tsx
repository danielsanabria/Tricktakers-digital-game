import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

interface RulebooksModalProps {
    isOpen?: boolean;
    onClose: () => void;
}

export const RulebooksModal: React.FC<RulebooksModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[100] bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-[#FCFAF6] rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-[#E7DFD0] space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-black text-[#23272E] uppercase tracking-tight">
                        {t('modals.rulebooksTitle')}
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-[#EFE9DC] hover:bg-[#E5DDCB] rounded-full text-[#6B5E4F] transition-colors shadow-sm active:scale-95 cursor-pointer">
                        <i className="fa-solid fa-xmark font-bold"></i>
                    </button>
                </div>
                <p className="text-[#7D7060] text-xs sm:text-sm font-medium">
                    {t('common.language') === 'Idioma' ? 'Consulta las reglas y referencias oficiales para resolver cualquier duda durante la partida.' : 'Consult official rules and references for guidance during tournament matches.'}
                </p>

                <div className="grid grid-cols-1 gap-4">
                    <a
                        href="/rules/Tricktakers_Base_Rulebook_copia.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#E7DFD0] hover:border-[#3E6B52] hover:bg-[#F2F7F4] transition-all group active:scale-[0.99]"
                    >
                        <div className="w-12 h-12 bg-[#3E6B52]/15 border border-[#3E6B52]/30 rounded-xl flex items-center justify-center text-[#2D543F] group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-book text-xl"></i>
                        </div>
                        <div>
                            <div className="font-bold text-[#23272E] group-hover:text-[#2D543F]">
                                {t('modals.baseRules')}
                            </div>
                            <div className="text-xs text-[#7D7060]">
                                {t('common.language') === 'Idioma' ? 'Reglas fundamentales y 8 personajes iniciales.' : 'Core rules and 8 starting characters.'}
                            </div>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-[#A09382] group-hover:text-[#2D543F]"></i>
                    </a>

                    <a
                        href="/rules/tricktakers_ex_rules_en_copia.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#E7DFD0] hover:border-[#C59B27] hover:bg-[#F7F2E8] transition-all group active:scale-[0.99]"
                    >
                        <div className="w-12 h-12 bg-[#C59B27]/15 border border-[#C59B27]/30 rounded-xl flex items-center justify-center text-[#966E0F] group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-scroll text-xl"></i>
                        </div>
                        <div>
                            <div className="font-bold text-[#23272E] group-hover:text-[#966E0F]">
                                {t('modals.exRules')}
                            </div>
                            <div className="text-xs text-[#7D7060]">
                                {t('common.language') === 'Idioma' ? 'Nuevos personajes y mecánicas avanzadas.' : 'New characters and advanced mechanics.'}
                            </div>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-[#A09382] group-hover:text-[#966E0F]"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};
