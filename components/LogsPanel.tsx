import React from 'react';

interface LogsPanelProps {
    isOpen?: boolean;
    logs: string[];
    onClose?: () => void;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ isOpen, logs, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300 fixed right-0 top-16 bottom-0 z-50 shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Crónica del Torneo</h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors"
                        title="Cerrar"
                    >
                        <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                {logs.map((log, i) => (
                    <div key={i} className={`text-xs font-medium leading-relaxed ${i === 0 ? 'text-teal-600 font-bold' : 'text-slate-500'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};
