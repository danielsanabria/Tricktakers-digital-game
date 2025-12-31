
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { CHARACTERS } from '../constants';
import GameCard from './GameCard';

interface PlayerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  onCardPlay: (cardId: string) => void;
  canPlay: boolean;
  onCharacterClick?: () => void;
  selectedCards?: string[];
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({
  player,
  isCurrentPlayer,
  onCardPlay,
  canPlay,
  onCharacterClick,
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
      ${isHuman ? 'p-4 sm:p-6' : 'p-4 flex flex-col justify-between'}
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
             ${isHuman ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12'}
             ${isCurrentPlayer ? 'border-teal-400 ring-2 ring-teal-100' : 'border-slate-200'}
          `}>
            {char ? (
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
            <h3 className={`font-black uppercase tracking-tight text-slate-800 ${isHuman ? 'text-xl' : 'text-sm'}`}>
              {player.name}
            </h3>
            {char && (
              <span className={`font-bold uppercase tracking-widest text-teal-600 ${isHuman ? 'text-[10px]' : 'text-[8px]'}`}>
                {char.name}
              </span>
            )}
          </div>
        </div>

        {/* Estadísticas: Puntos y Bazas */}
        <div className={`flex gap-4 items-center bg-white rounded-xl border border-slate-100 shadow-sm ${isHuman ? 'px-6 py-2' : 'px-3 py-1.5'}`}>
          <div className="text-center">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Puntos</p>
            <p className={`font-black text-amber-500 ${isHuman ? 'text-2xl' : 'text-lg'}`}>{player.score}</p>
          </div>
          <div className="w-px h-6 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Bazas</p>
            <p className={`font-black text-teal-500 ${isHuman ? 'text-2xl' : 'text-lg'}`}>{player.wins}<span className="text-slate-300 text-xs font-normal">/5</span></p>
          </div>
        </div>
      </div>

      {/* Objetos y Tareas (Info Pública) */}
      {(player.items.length > 0 || player.tasks.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4 min-h-[24px]">
          {player.items.map((it, idx) => (
            <div key={idx} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg text-[8px] font-black uppercase flex items-center gap-1">
              <i className="fa-solid fa-toolbox"></i> {it.name}
            </div>
          ))}
          {player.tasks.map((t, idx) => (
            <div key={idx} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-500 rounded-lg text-[8px] font-black uppercase flex items-center gap-1">
              <i className="fa-solid fa-scroll"></i> {t.name}
            </div>
          ))}
        </div>
      )}

      {/* ÁREA DE MANO DIFERENCIADA */}
      {isHuman ? (
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
        // RIVAL: Resumen Compacto y Prioridad a Datos
        <div className="flex flex-col gap-2">
          {/* Stats Row */}
          <div className="flex justify-between items-center bg-slate-100 rounded-lg p-2">
            <div className="flex flex-col items-center w-1/2 border-r border-slate-200">
              <span className="text-[9px] font-black uppercase text-slate-400">Puntos</span>
              <span className="text-xl font-black text-amber-500">{player.score}</span>
            </div>
            <div className="flex flex-col items-center w-1/2">
              <span className="text-[9px] font-black uppercase text-slate-400">Bazas</span>
              <span className="text-xl font-black text-teal-500">{player.wins}<span className="text-xs text-slate-300">/5</span></span>
            </div>
          </div>

          {/* Status/Hand Info */}
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {player.hand.length} Cartas
            </div>
            {/* Active Abilities Icons/Badges */}
            <div className="flex gap-1">
              {player.thiefBetrayalMode && <span title="Traición Activa" className="text-xs text-red-500 font-bold">🗡️</span>}
              {player.rulerUsedRuleAvoidance && <span title="Reglas Ignoradas" className="text-xs text-purple-500 font-bold">👁️</span>}
              {/* Add more status icons if needed */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerBoard;
