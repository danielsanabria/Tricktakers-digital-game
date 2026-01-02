
import React, { useState, useEffect } from 'react';
import { Player, CharacterType } from '../game/core/types';
import { CHARACTERS } from '../game/core/constants';
import GameCard from './GameCard';

interface PlayerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  onCardPlay: (cardId: string) => void;
  canPlay: boolean;
  onCharacterClick?: () => void;
  onItemClick?: (itemCardPath: string) => void;
  selectedCards?: string[];
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({
  player,
  isCurrentPlayer,
  onCardPlay,
  canPlay,
  onCharacterClick,
  onItemClick,
  selectedCards = []
}) => {
  const char = player.character ? CHARACTERS[player.character] : null;
  const [imgSrc, setImgSrc] = useState<string>('');
  const [attemptIndex, setAttemptIndex] = useState(0);

  const isHuman = player.id === 'p1';

  // Generate fallback list
  const getCandidatePaths = (filename: string) => {
    const nameNoExt = filename.substring(0, filename.lastIndexOf('.'));
    return [
      `/assets/chars/${filename}`,
      `/assets/${filename}`,
      `assets/${filename}`,
      `/assets/${filename.toLowerCase()}`,
      `/assets/chars/${nameNoExt}.png`,
      `/assets/chars/${nameNoExt}.jpg`,
      `/assets/chars/${nameNoExt}.jpeg`
    ];
  };

  const candidates = char ? getCandidatePaths(char.imagePath) : [];

  useEffect(() => {
    if (char) {
      setAttemptIndex(0);
      setImgSrc(candidates[0]);
    }
  }, [char?.id, char?.imagePath]);

  const handleImageError = () => {
    const nextIndex = attemptIndex + 1;
    if (nextIndex < candidates.length) {
      setAttemptIndex(nextIndex);
      setImgSrc(candidates[nextIndex]);
    } else {
      setImgSrc('https://via.placeholder.com/150?text=?');
    }
  };

  return (
    <div className={`
      relative rounded-[2rem] transition-all duration-500 border overflow-hidden
      ${isCurrentPlayer ? 'bg-white shadow-2xl border-teal-200 scale-[1.01] z-10' : 'bg-slate-50/80 border-slate-200'}
      ${isHuman ? 'p-3 sm:p-4 md:p-3' : 'p-4 flex flex-col justify-between'}
    `}>

      {/* Header Info: Nombre, Avatar, Stats */}
      <div className="flex justify-between items-center gap-4 mb-4">

        {/* Perfil del Personaje */}
        <div
          onClick={onCharacterClick}
          className="flex items-center gap-3 cursor-pointer group"
          title="Ver detalles del personaje"
        >
          <div className={`relative rounded-2xl border-2 shadow-sm overflow-hidden bg-white shrink-0 transition-all
             ${isHuman ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-16 md:h-16' : 'w-12 h-12'}
             ${isCurrentPlayer ? 'border-teal-400 ring-2 ring-teal-100' : 'border-slate-200'}
          `}>
            {char && imgSrc ? (
              <img
                key={imgSrc}
                src={imgSrc}
                className="w-full h-full object-cover"
                onError={handleImageError}
                alt={char.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-xl text-slate-200">{player.name[0]}</div>
            )}

            {/* Indicador de Turno */}
            {isCurrentPlayer && <div className="absolute top-0 right-0 w-3 h-3 bg-teal-500 rounded-full border-2 border-white animate-pulse"></div>}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className={`font-black uppercase tracking-tight text-slate-800 ${isHuman ? 'text-xl' : 'text-sm'}`}>
                {player.name}
              </h3>
              {/* Active Abilities Icons/Badges next to name */}
              <div className="flex gap-1">
                {player.thiefBetrayalMode && <span title="Traición Activa" className="text-xs text-red-500 font-bold">🗡️</span>}
                {player.rulerUsedRuleAvoidance && <span title="Reglas Ignoradas" className="text-xs text-purple-500 font-bold">👁️</span>}
                {player.revoltUsed && <span title="Rebelión Usada" className="text-[10px] text-amber-500 font-bold">🔥</span>}
                {player.hermitUsedAbility && <span title="Ermitaño Activo" className="text-[10px] text-blue-500 font-bold">🏔️</span>}
              </div>
            </div>
            {char && (
              <span className={`font-bold uppercase tracking-widest text-teal-600 ${isHuman ? 'text-[10px]' : 'text-[8px]'}`}>
                {char.name}
              </span>
            )}
          </div>
        </div>

        {/* Removed redundant header stats block */}
      </div>

      {/* Objetos y Tareas (Info Pública) */}
      {(player.items.length > 0 || player.tasks.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4 min-h-[24px]">
          {player.items.map((it, idx) => (
            <button
              key={idx}
              onClick={() => onItemClick?.(it.itemCardPath)}
              className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg text-[8px] font-black uppercase flex items-center gap-1 hover:bg-amber-100 transition-colors"
            >
              <i className="fa-solid fa-toolbox"></i> {it.name}
            </button>
          ))}
          {player.tasks.map((t, idx) => (
            <div key={idx} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-500 rounded-lg text-[8px] font-black uppercase flex items-center gap-1">
              <i className="fa-solid fa-scroll"></i> {t.name}
            </div>
          ))}
        </div>
      )}

      {/* ÁREA DE ESTADÍSTICAS (Below header, good for mobile) */}
      <div className="flex justify-between items-center bg-slate-100 rounded-2xl p-3 mb-4 relative overflow-hidden">
        {/* Gambler Bid Overlay/Badge */}
        {player.character === CharacterType.GAMBLER && player.bid !== undefined && (
          <div className="absolute top-0 right-0 bg-amber-500 text-white px-2 py-0.5 rounded-bl-lg text-[8px] font-black uppercase tracking-tighter">
            Apuesta: {player.bid}
          </div>
        )}

        {/* Summoner MP Badge */}
        {player.character === CharacterType.SUMMONER && (
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-2 py-0.5 rounded-bl-lg text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
            <i className="fa-solid fa-bolt text-[6px]"></i> {player.mp || 0} MP
          </div>
        )}

        {/* Adventurer Slots Badge */}
        {player.character === CharacterType.ADVENTURER && (
          <div className="absolute top-0 right-0 bg-sky-600 text-white px-2 py-0.5 rounded-bl-lg text-[8px] font-black uppercase tracking-tighter">
            Salas: {player.items.length}/{player.itemSlots || 2}
          </div>
        )}

        {/* Ruler Tasks Badge */}
        {player.character === CharacterType.RULER && player.tasks && player.tasks.length > 0 && (
          <div className="absolute top-0 right-0 bg-slate-800 text-white px-2 py-0.5 rounded-bl-lg text-[8px] font-black uppercase tracking-tighter">
            Tareas: {player.tasks.filter(t => t.completed).length}/{player.tasks.length}
          </div>
        )}

        {/* Resistance Revolt Badge */}
        {player.character === CharacterType.RESISTANCE && (
          <div className="absolute top-0 right-0 bg-rose-600 text-white px-2 py-0.5 rounded-bl-lg text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
            {player.revoltUsed && <span className="animate-pulse">Activa</span>}
            <span>Revoluciones: {player.revoltsLeft || 0}</span>
          </div>
        )}
        <div className="flex flex-col items-center w-1/2 border-r border-slate-200">
          <span className="text-[9px] font-black uppercase text-slate-400">Puntos</span>
          <span className={`${isHuman ? 'text-3xl' : 'text-xl'} font-black text-amber-500`}>{player.score}</span>
        </div>
        <div className="flex flex-col items-center w-1/2">
          <span className="text-[9px] font-black uppercase text-slate-400">Bazas</span>
          <div className="flex items-baseline gap-0.5">
            <span className={`${isHuman ? 'text-3xl' : 'text-xl'} font-black text-teal-500`}>
              {player.wins}
            </span>
            <span className="text-sm text-slate-400 font-bold">/5</span>
          </div>
        </div>
      </div>

      {/* ÁREA DE MANO DIFERENCIADA */}
      {
        isHuman ? (
          // JUGADOR: Mano Interactiva Completa
          <div className="flex flex-wrap gap-3 justify-center bg-slate-50 p-4 rounded-[1.5rem] border border-slate-200/50 shadow-inner min-h-[160px]">
            {player.hand.map(card => (
              <GameCard
                key={card.id}
                card={card}
                onClick={() => onCardPlay(card.id)}
                disabled={!canPlay}
                small={window.innerWidth < 640}
                selected={selectedCards.includes(card.id)}
              />
            ))}
            {player.hand.length === 0 && (
              <div className="w-full flex items-center justify-center h-32 opacity-30">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sin cartas</p>
              </div>
            )}
          </div>
        ) : (
          // RIVAL: Resumen Compacto (Sin cartas visibles)
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {player.hand.length} Cartas en mano
            </div>
            <div className="text-[10px] font-bold text-slate-300 italic">
              Oculto
            </div>
          </div>
        )
      }
    </div >
  );
};

export default PlayerBoard;
