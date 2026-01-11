import React from 'react';
import { Player } from '../game/core/types';

interface AlchemistBoardProps {
    player: Player;
}

export const AlchemistBoard: React.FC<AlchemistBoardProps> = ({ player }) => {
    const elements = player.magicElements || [];

    // Group elements by type for display count
    const elementCounts = elements.reduce((acc, el) => {
        acc[el] = (acc[el] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="mt-2 p-2 bg-purple-900/90 rounded-lg border border-purple-500/50 shadow-lg">
            <h4 className="text-purple-100 text-xs font-bold uppercase mb-1 drop-shadow-sm">Círculo Mágico</h4>

            <div className="flex flex-wrap gap-2 text-[10px] text-purple-200">
                {elementCounts['3_OF_A_KIND'] && (
                    <div className="px-2 py-0.5 bg-purple-800 rounded border border-purple-600 shadow-sm">
                        Tertias: <span className="text-white font-bold">{elementCounts['3_OF_A_KIND']}</span>
                    </div>
                )}
                {elementCounts['FLUSH'] && (
                    <div className="px-2 py-0.5 bg-blue-800 rounded border border-blue-600 shadow-sm">
                        Colores: <span className="text-white font-bold">{elementCounts['FLUSH']}</span>
                    </div>
                )}
                {elementCounts['STRAIGHT'] && (
                    <div className="px-2 py-0.5 bg-green-800 rounded border border-green-600 shadow-sm">
                        Corridas: <span className="text-white font-bold">{elementCounts['STRAIGHT']}</span>
                    </div>
                )}
                {elementCounts['SAME_AS_LEAD'] && (
                    <div className="px-2 py-0.5 bg-amber-800 rounded border border-amber-600 shadow-sm">
                        Resonancias: <span className="text-white font-bold">{elementCounts['SAME_AS_LEAD']}</span>
                    </div>
                )}
                {elementCounts['TRICK_WIN'] && (
                    <div className="px-2 py-0.5 bg-yellow-800 rounded border border-yellow-600 shadow-sm">
                        Victorias: <span className="text-white font-bold">{elementCounts['TRICK_WIN']}</span>
                    </div>
                )}
            </div>

            {elements.length === 0 && (
                <div className="text-[10px] text-purple-200 italic opacity-80">
                    Sin elementos recolectados...
                </div>
            )}

            <div className="mt-1 pb-1 flex justify-between items-end border-t border-purple-500/30 pt-1">
                <div className="text-[10px] text-purple-100">
                    Deck Restante: <span className="font-bold text-white ml-1">{player.alchemistDeck?.length || 0}</span>
                </div>
            </div>
        </div>
    );
};
