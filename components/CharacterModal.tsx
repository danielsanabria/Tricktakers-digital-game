
import React, { useState, useEffect } from 'react';
import { CharacterData } from '../types';

interface CharacterModalProps {
  character: CharacterData;
  onClose: () => void;
}

const CharacterModal: React.FC<CharacterModalProps> = ({ character, onClose }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [hasFinalError, setHasFinalError] = useState(false);

  // Generate fallback list
  const getCandidatePaths = (filename: string) => {
    const nameNoExt = filename.substring(0, filename.lastIndexOf('.'));
    // Prioritize root assets folder as requested by user
    return [
      `/assets/chars/${filename}`,           // 1. Correct Path
      `/assets/${filename}`,                 // 2. Root Assets
      `assets/${filename}`,
      `/assets/${filename.toLowerCase()}`,
      // Extensions
      `/assets/chars/${nameNoExt}.png`,
      `/assets/chars/${nameNoExt}.jpg`,
      `/assets/chars/${nameNoExt}.jpeg`
    ];
  };

  const candidates = getCandidatePaths(character.imagePath);

  useEffect(() => {
    setAttemptIndex(0);
    setHasFinalError(false);
    setImgSrc(candidates[0]);
  }, [character.imagePath]);

  const handleError = () => {
    const nextIndex = attemptIndex + 1;
    if (nextIndex < candidates.length) {
      setAttemptIndex(nextIndex);
      setImgSrc(candidates[nextIndex]);
    } else {
      setHasFinalError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-transparent perspective-1000"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-rose-400 text-4xl transition-colors drop-shadow-lg z-50"
        >
          <i className="fa-solid fa-times"></i>
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/10 transform transition-all max-h-[90vh] flex flex-col">
          <div className="bg-slate-100 flex-1 flex items-center justify-center relative overflow-y-auto custom-scrollbar min-h-[200px]">
            {!hasFinalError ? (
              <img
                key={imgSrc} // Force re-render on src change to trigger onError
                src={imgSrc}
                alt={character.name}
                onError={handleError}
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                <i className="fa-solid fa-image-slash text-6xl mb-4"></i>
                <p className="font-bold">Imagen no disponible</p>
                <p className="text-xs font-mono mt-2 bg-slate-200 px-2 py-1 rounded select-all break-all max-w-[200px] text-center">
                  {character.imagePath}
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white p-6 text-center relative shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>

            <h3 className="text-3xl font-black uppercase tracking-widest text-teal-400 mb-2">{character.name}</h3>
            <p className="text-sm text-slate-300 italic mb-4 font-serif">"{character.catchphrase}"</p>

            <div className="grid grid-cols-2 gap-4 text-left text-xs bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div>
                <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Habilidad</span>
                <span className="text-white font-bold">{character.abilityName}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Dificultad</span>
                <span className={`font-bold ${character.difficulty === 'EASY' ? 'text-green-400' : character.difficulty === 'HARD' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {character.difficulty}
                </span>
              </div>
              <div className="col-span-2 border-t border-slate-700 pt-2 mt-2">
                <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">Descripción</span>
                <p className="text-slate-300 leading-relaxed">{character.description}</p>
              </div>

              {/* Points Table - Added to visualize scoring since images might be missing */}
              <div className="col-span-2 border-t border-slate-700 pt-2 mt-2">
                <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Tabla de Puntos</span>
                <div className="grid grid-cols-6 gap-0.5 text-center">
                  {[0, 1, 2, 3, 4, 5].map(wins => (
                    <div key={wins} className="bg-slate-700 p-1 rounded">
                      <span className="block text-[8px] text-slate-400">Wins</span>
                      <span className="font-black text-amber-400 text-lg leading-none">{wins}</span>
                      <span className="block text-[9px] font-bold text-white border-t border-slate-600 mt-0.5 pt-0.5">
                        {character.pointsByWins[wins] >= 900 ? 'WIN' : character.pointsByWins[wins]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {character.winConditionText && (
                <div className="col-span-2 border-t border-slate-700 pt-2 mt-2">
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">Condición Victoria</span>
                  <p className="text-amber-400 font-black">{character.winConditionText}</p>
                </div>
              )}
            </div>

            <p className="mt-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Click fuera para cerrar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;
