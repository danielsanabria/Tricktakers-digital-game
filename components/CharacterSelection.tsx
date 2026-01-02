
import React from 'react';
import { Player, CharacterType, GamePhase } from '../game/core/types';
import { CHARACTERS } from '../game/core/constants';

interface CharacterSelectionProps {
    players: Player[];
    selectionOrder: string[];
    selectionIndex: number;
    characterPool: CharacterType[];
    selectCharacter: (charType: CharacterType) => void;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({
    players,
    selectionOrder,
    selectionIndex,
    characterPool,
    selectCharacter
}) => {
    const currentPicker = players.find(p => p.id === selectionOrder[selectionIndex]);
    const isUserTurn = currentPicker?.id === 'p1';

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col h-full animate-in fade-in duration-500">
            {/* Header de Selección */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tighter mb-2">Selección de Personaje</h2>
                <div className="inline-flex items-center gap-4 bg-white px-8 py-3 rounded-full shadow-sm border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Turno actual</span>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <span className={`font-black uppercase text-lg ${isUserTurn ? 'text-teal-500 animate-pulse' : 'text-slate-700'}`}>
                        {currentPicker?.name}
                    </span>
                </div>
            </div>

            {/* Grid de Personajes - Estilo Clásico/Premium */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-48">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
                    {(characterPool || []).map(ct => {
                        const char = CHARACTERS[ct];
                        const taker = players.find(p => p.character === ct);
                        const isTaken = !!taker;
                        const canSelect = isUserTurn && !isTaken;

                        // King Ban Rule: Cannot pick King if you were King last round
                        const isBanned = ct === CharacterType.KING && currentPicker?.lastCharacter === CharacterType.KING;

                        return (
                            <div
                                key={ct}
                                onClick={() => canSelect && !isBanned && selectCharacter(ct)}
                                className={`
                                    relative group transition-all duration-500
                                    ${isTaken || isBanned ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:-translate-y-2 cursor-pointer'}
                                `}
                            >
                                {/* Card Body */}
                                <div className={`
                                    aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-slate-200 relative shadow-lg
                                    ${canSelect ? 'ring-4 ring-transparent group-hover:ring-teal-400 group-hover:shadow-teal-500/30' : ''}
                                `}>
                                    <img
                                        src={`/assets/thumb/${char.thumbnailPath || `${char.id}-thumb.jpg`}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        alt={char.name}
                                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x400?text=' + char.name)}
                                    />

                                    {/* Info Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-10">
                                        <h4 className="text-white font-black text-xl uppercase leading-none mb-1">{char.name}</h4>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md text-white uppercase
                                                ${char.difficulty === 'EASY' ? 'bg-emerald-500' : char.difficulty === 'HARD' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                                                {char.difficulty}
                                            </span>
                                            <i className="fa-solid fa-circle-info text-white/50 text-xs"></i>
                                        </div>
                                    </div>

                                    {/* Taken Overlay */}
                                    {isTaken && (
                                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white mb-2 border-2 border-slate-600">
                                                <i className="fa-solid fa-check"></i>
                                            </div>
                                            <span className="text-white font-bold text-sm uppercase tracking-wider">{taker.name}</span>
                                        </div>
                                    )}

                                    {/* Selection Hover Effect */}
                                    {canSelect && (
                                        <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white text-teal-600 px-6 py-2 rounded-full font-black text-xs uppercase shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                Seleccionar
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Character Illustrations Footer (Similar to HomeMenu) */}
            <div className="fixed bottom-0 left-0 w-full h-[25vh] pointer-events-none z-0 overflow-hidden hidden md:block">
                <img src="/assets/chars-no-bg/1A-no-bg.png" className="absolute -bottom-10 -left-10 h-full object-contain opacity-10 blur-[1px] transform -scale-x-100" />
                <img src="/assets/chars-no-bg/5A-no-bg.png" className="absolute -bottom-10 -right-10 h-full object-contain opacity-10 blur-[1px]" />
            </div>

            {/* Mobile Footer Decor */}
            <div className="fixed bottom-0 left-0 w-full h-[150px] md:hidden flex justify-between pointer-events-none z-0 overflow-hidden opacity-20">
                <img src="/assets/chars-no-bg/1A-no-bg.png" className="h-full object-contain -ml-8 transform translate-y-4" />
                <img src="/assets/chars-no-bg/5A-no-bg.png" className="h-full object-contain -mr-8 transform translate-y-4" />
            </div>
        </div>
    );
};
