
import React from 'react';
import { Player } from '../game/core/types';

interface PhantomThiefBoardProps {
    player: Player;
    onAction: (action: string, payload?: any) => void;
    abilityMode: string;
}

export const PhantomThiefBoard: React.FC<PhantomThiefBoardProps> = ({ player, onAction, abilityMode }) => {
    const isExchangeMode = abilityMode === 'PHANTOM_EXCHANGE';

    return (
        <div className="flex flex-col items-center gap-2 mb-3 bg-slate-900/50 p-2 rounded-xl backdrop-blur-sm border border-slate-700">
            {/* Target Info */}
            <div className="text-[10px] text-slate-300 font-medium tracking-wide w-full text-center border-b border-slate-700/50 pb-1 mb-1">
                Socio: <span className="text-purple-400 font-bold">{player.thiefPartnerId}</span> |
                Objetivos: <span className="text-red-400 font-bold">{player.thiefTargetIds?.join(', ')}</span>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-4 w-full justify-center">

                {/* Chip Toggle */}
                <div
                    className="flex flex-col items-center cursor-pointer group relative"
                    onClick={() => onAction('PHANTOM_TOGGLE_CHIP')}
                    title="Cambiar Predicción"
                >
                    <div className={`w-12 h-12 relative transition-all duration-300 ${player.thiefChipValue !== 0 ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'opacity-80 grayscale-[0.3]'}`}>
                        <img src="/assets/5c-cards/chip-phantom.png" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                        Predicción: <span className="text-blue-400">{player.thiefChipValue === 0 ? '0' : '±1'}</span>
                    </span>
                </div>

                {/* Exchange Button Block */}
                <div className="flex flex-col items-center justify-center min-w-[100px]">
                    {!isExchangeMode ? (
                        <button
                            onClick={() => onAction('PHANTOM_INIT_EXCHANGE')}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg shadow-lg text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
                        >
                            Intercambiar
                        </button>
                    ) : (
                        <div className="flex flex-col gap-1 w-full animate-fadeIn">
                            <span className="text-[8px] text-purple-300 uppercase font-bold animate-pulse text-center">Selecciona carta...</span>
                            <div className="flex gap-1 justify-center">
                                <button
                                    onClick={() => onAction('PHANTOM_EXCHANGE_REQUEST')}
                                    className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-[9px] font-bold"
                                >
                                    Confirmar
                                </button>
                                <button
                                    onClick={() => onAction('CANCEL_ABILITY')}
                                    className="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-[9px] font-bold"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Betrayal Toggle */}
                <div
                    className="flex flex-col items-center cursor-pointer group relative"
                    onClick={() => onAction('PHANTOM_TOGGLE_BETRAYAL')}
                    title="Activar Modo Traición"
                >
                    <div className={`w-12 h-12 relative transition-all duration-300 ${player.thiefBetrayalMode ? 'scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'opacity-60 grayscale'}`}>
                        <img src="/assets/5c-cards/chip-wolf.png" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                        Traición: <span className={player.thiefBetrayalMode ? "text-red-500" : "text-slate-500"}>{player.thiefBetrayalMode ? 'ON' : 'OFF'}</span>
                    </span>
                </div>

            </div>
        </div>
    );
};
