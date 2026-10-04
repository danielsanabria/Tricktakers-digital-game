import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

interface BerserkerSetupModalProps {
    onConfirm: () => void;
}

export const BerserkerSetupModal: React.FC<BerserkerSetupModalProps> = ({ onConfirm }) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-rose-900 p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-rose-500 mb-2 uppercase tracking-tighter italic">
                        {isSpanish ? '¡Modo Berserker Intimidante!' : 'Fierce Berserker Mode!'}
                    </h2>
                    <p className="text-slate-400">
                        {isSpanish
                            ? 'Rechaza las cartas débiles de los mortales y toma tu Hacha.'
                            : 'Cast aside weak mortal cards and take up your Great Axe.'}
                    </p>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onConfirm}
                        className="btn btn-rose !text-xl !py-6 !px-12 !rounded-full shadow-2xl shadow-rose-600/40 font-black tracking-wider"
                    >
                        {isSpanish ? 'ACEPTAR PODER' : 'UNLEASH FURY'}
                    </button>
                </div>
            </div>
        </div>
    );
};
