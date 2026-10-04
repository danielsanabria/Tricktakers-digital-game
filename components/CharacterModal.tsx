
import React, { useState, useEffect } from 'react';
import { CharacterData } from '../game/core/types';
import { useTranslation } from '../i18n/LanguageContext';

interface CharacterModalProps {
  character: CharacterData | null;
  onClose: () => void;
}

const CharacterModal: React.FC<CharacterModalProps> = ({ character, onClose }) => {
  if (!character) return null;

  const { t, translations } = useTranslation();
  const localized = translations.gameData.characters[character.id];
  const charName = localized?.name || character.name;
  const catchphrase = localized?.catchphrase || character.catchphrase;
  const abilityName = localized?.abilityName || character.abilityName;
  const description = localized?.description || character.description;
  const winConditionText = localized?.winConditionText || character.winConditionText;
  const difficulty = localized?.difficulty || character.difficulty;

  const [imgSrc, setImgSrc] = useState<string>('');
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [hasFinalError, setHasFinalError] = useState(false);

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
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-transparent perspective-1000 my-8 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="fixed top-4 right-4 bg-black/50 hover:bg-black/70 text-white hover:text-rose-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all drop-shadow-lg z-[110] backdrop-blur-sm border border-white/10"
        >
          <i className="fa-solid fa-times"></i>
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/10 transform transition-all flex flex-col w-full">
          <div className="bg-slate-100 flex-1 relative min-h-[400px]">
            {!hasFinalError && imgSrc ? (
              <img
                key={imgSrc}
                src={imgSrc}
                alt={charName}
                onError={handleError}
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                <i className="fa-solid fa-image-slash text-6xl mb-4"></i>
                <p className="font-bold">Image unavailable</p>
                <p className="text-xs font-mono mt-2 bg-slate-200 px-2 py-1 rounded select-all break-all max-w-[200px] text-center">
                  {character.imagePath}
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white p-6 text-center relative shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>

            <h3 className="text-3xl font-black uppercase tracking-widest text-teal-400 mb-2">{charName}</h3>
            <p className="text-sm text-slate-300 italic mb-4 font-serif">"{catchphrase}"</p>

            <div className="grid grid-cols-2 gap-4 text-left text-xs bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div>
                <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('modals.ability')}</span>
                <span className="text-white font-bold">{abilityName}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t('modals.difficulty')}</span>
                <span className={`font-bold ${character.difficulty === 'EASY' ? 'text-green-400' : character.difficulty === 'HARD' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {difficulty}
                </span>
              </div>
              <div className="col-span-2 border-t border-slate-700 pt-2 mt-2">
                <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">{t('modals.charInfoTitle')}</span>
                <p className="text-slate-300 leading-relaxed">{description}</p>
              </div>

              {/* Points Table */}
              <div className="col-span-2 border-t border-slate-700 pt-2 mt-2">
                <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">{t('modals.pointsByWins')}</span>
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

              {winConditionText && (
                <div className="col-span-2 border-t border-slate-700 pt-2 mt-2">
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">{t('modals.winCondition')}</span>
                  <p className="text-amber-400 font-black">{winConditionText}</p>
                </div>
              )}
            </div>

            <p className="mt-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              {t('common.close')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;
