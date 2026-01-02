import React from 'react';

interface RulebooksModalProps {
    onClose: () => void;
}

export const RulebooksModal: React.FC<RulebooksModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Manuales de Reglas</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <p className="text-slate-500 text-sm">Consulta las reglas oficiales para resolver tus dudas.</p>

                <div className="grid grid-cols-1 gap-4">
                    <a
                        href="/rules/Tricktakers_Base_Rulebook_copia.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-book text-xl"></i>
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 group-hover:text-teal-700">Tricktakers Base</div>
                            <div className="text-xs text-slate-400">Reglas fundamentales y personajes básicos.</div>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-slate-300 group-hover:text-teal-500"></i>
                    </a>

                    <a
                        href="/rules/tricktakers_ex_rules_en_copia.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-scroll text-xl"></i>
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 group-hover:text-amber-700">Expansión (Inglés)</div>
                            <div className="text-xs text-slate-400">Nuevos personajes y mecánicas avanzadas.</div>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-slate-300 group-hover:text-amber-500"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};
