
import React from 'react';

interface BerserkerSetupModalProps {
    onConfirm: () => void;
}

export const BerserkerSetupModal: React.FC<BerserkerSetupModalProps> = ({ onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-rose-900 p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-rose-500 mb-2 uppercase tracking-tighter italic">¡Modo Berserker Intimidante!</h2>
                    <p className="text-slate-400">Rechaza las cartas débiles de los mortales y toma tu Hacha.</p>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onConfirm}
                        className="btn btn-rose !text-xl !py-6 !px-12 !rounded-full shadow-2xl shadow-rose-600/40"
                    >
                        ACEPTAR PODER
                    </button>
                </div>
            </div>
        </div>
    );
};
