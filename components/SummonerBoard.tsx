import React from 'react';
import { Player } from '../game/core/types';
import { BEASTS } from '../game/core/constants';
import { useTranslation } from '../i18n/LanguageContext';

interface SummonerBoardProps {
    player: Player;
}

export const SummonerBoard: React.FC<SummonerBoardProps> = ({ player }) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';

    // MP Tokens
    const mpTokens = Array.from({ length: player.mp }).map((_, i) => (
        <img
            key={`mp-${i}`}
            src="/assets/2c-cards/summon-cube.png"
            alt="MP"
            className="w-6 h-6 object-contain drop-shadow-md hover:scale-110 transition-transform"
        />
    ));

    return (
        <div className="flex flex-col gap-2 p-2 bg-indigo-900/10 rounded-xl border border-indigo-200 mt-2">
            {/* Header / MP Area */}
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-indigo-800 tracking-widest">
                    {isSpanish ? 'Invocador' : 'Summoner'}
                </span>
                <div className="flex flex-wrap gap-1 bg-indigo-100/50 p-1 rounded-lg min-w-[60px] justify-center items-center">
                    {mpTokens}
                    {player.mp === 0 && <span className="text-[8px] text-indigo-400 font-bold">{isSpanish ? 'Sin MP' : 'No MP'}</span>}
                </div>
            </div>

            {/* Rear Beasts Area */}
            <div className="flex gap-2 justify-center min-h-[100px]">
                {/* Slot 1 */}
                <BeastSlot player={player} index={0} isSpanish={isSpanish} />
                {/* Slot 2 */}
                <BeastSlot player={player} index={1} isSpanish={isSpanish} />
            </div>
        </div>
    );
};

const BeastSlot: React.FC<{ player: Player, index: number, isSpanish: boolean }> = ({ player, index, isSpanish }) => {
    const beastId = player.rearBeasts[index];
    const beast = beastId ? BEASTS.find(b => b.id === beastId) : null;

    let bgImage = "/assets/2c-cards/summon-cube.png";

    const cardImage = beast ? getBeastImage(beast.id) : null;
    const sheetImage = beast && (beast.id === 'b-el' || beast.id === 'b-miria')
        ? `/assets/2c-cards/summon-sheet-${beast.id === 'b-el' ? 'el' : 'miria'}.jpg`
        : null;

    return (
        <div className="relative w-20 h-28 rounded-lg border-2 border-dashed border-indigo-300 flex items-center justify-center bg-indigo-50/50 overflow-hidden group">
            {/* Sheet Background if applicable */}
            {sheetImage && <img src={sheetImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Sheet" />}

            {/* Beast Card */}
            {beast ? (
                <div className="relative z-10 w-16 h-24 transform transition-transform group-hover:scale-110">
                    <img
                        src={cardImage || ''}
                        className="w-full h-full object-cover rounded shadow-lg border border-white"
                        alt={beast.name}
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/64x96?text=?'; }}
                    />
                    {/* Name Label */}
                    <div className="absolute bottom-0 w-full bg-black/70 text-white text-[6px] font-bold text-center py-0.5 truncate">
                        {beast.name}
                    </div>
                </div>
            ) : (
                <span className="text-[8px] text-indigo-300 font-bold uppercase">{isSpanish ? 'Vacío' : 'Empty'}</span>
            )}
        </div>
    );
};

// Helper to resolve image paths based on file list from assets
const getBeastImage = (id: string): string => {
    // Mapping based on known assets
    if (id === 'b-el') return '/assets/2c-cards/el-front.jpg';
    if (id === 'b-miria') return '/assets/2c-cards/miria-front.jpg';
    if (id === 'b-maru') return '/assets/2c-cards/maru-front.jpg';
    if (id === 'b-guru') return '/assets/2c-cards/guru-front.jpg';
    if (id === 'b-nemu') return '/assets/2c-cards/nemu-front.jpg';
    if (id === 'b-oko') return '/assets/2c-cards/oko-front.jpg';
    return '';
};
