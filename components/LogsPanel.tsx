
import React from 'react';

interface LogsPanelProps {
    logs: string[];
    onClose?: () => void; // Optional if we want a close button
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ logs }) => {
    return (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300 fixed right-0 top-16 bottom-0 z-50 shadow-2xl">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Crónica del Torneo</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {logs.map((log, i) => (
                    <div key={i} className={`text-xs font-medium leading-relaxed ${i === 0 ? 'text-teal-600 font-bold' : 'text-slate-500'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};
