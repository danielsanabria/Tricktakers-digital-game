
import React, { useState, useEffect } from 'react';
import { Card, Suit, CardType } from '../types';
import { SUIT_COLORS, SUIT_ICONS, SUIT_BG_COLORS } from '../constants';

interface GameCardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  selected?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ card, onClick, disabled, small, selected }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImgSrc, setCurrentImgSrc] = useState('');

  const borderClass = SUIT_COLORS[card.suit] || 'border-slate-300 text-slate-400';
  const bgClass = SUIT_BG_COLORS[card.suit] || 'bg-white';

  // Specific colors matching the manual image samples
  const manualColors: Record<Suit, string> = {
    [Suit.RED]: '#f47b6e',
    [Suit.BLUE]: '#89a1d1',
    [Suit.GREEN]: '#6ab3a4',
    [Suit.BLACK]: '#3c3532',
    [Suit.COLORLESS]: '#e0b35e'
  };

  const cardBorderColor = manualColors[card.suit] || '#cbd5e1';

  const getCardLabel = () => {
    if (card.type === CardType.RARE) return 'R';
    if (card.type === CardType.WHITE_FLAG) return '0';
    return card.value;
  };

  useEffect(() => {
    const getPath = () => {
      if (card.imagePath) {
        // Support absolute paths
        if (card.imagePath.startsWith('/')) return card.imagePath;
        return `/assets/cards/${card.imagePath}`;
      }
      if (card.type === CardType.RARE) return '/assets/color-cards/rare.jpg';
      if (card.type === CardType.WHITE_FLAG) return '/assets/color-cards/whiteflag.jpg';
      if (card.type === CardType.NUMBER) {
        const valStr = card.value.toString().padStart(2, '0');
        return `/assets/color-cards/${card.suit.toLowerCase()}-${valStr}.jpg`;
      }
      return '';
    };

    const path = getPath();
    setCurrentImgSrc(path);
    setImageError(false);
  }, [card.id, card.type, card.suit, card.value, card.imagePath]);

  const handleImageError = () => {
    setImageError(true);
  };

  if (card.isFacedown) {
    return (
      <div className={`${small ? 'w-14 h-20 sm:w-20 sm:h-28' : 'w-24 h-36 sm:w-32 sm:h-48'} bg-slate-100 border-2 border-slate-300 rounded-xl flex items-center justify-center text-slate-300 shadow-sm relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
        <span className="font-black text-2xl tracking-tighter opacity-20">TT</span>
      </div>
    );
  }

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
          ${small ? 'w-14 h-20 sm:w-20 sm:h-28' : 'w-24 h-36 sm:w-32 sm:h-48'}
          relative group transition-all duration-300
          ${!disabled ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl' : 'opacity-90'}
          ${selected ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 z-20 rounded-xl' : ''}
        `}
    >
      {/* Main Asset Image */}
      <div className="w-full h-full rounded-xl overflow-hidden shadow-lg bg-slate-200">
        {!imageError && currentImgSrc ? (
          <img
            src={currentImgSrc}
            onError={handleImageError}
            className="w-full h-full object-cover"
            alt={`${card.suit} ${card.value}`}
          />
        ) : (
          // Fallback if image missing (e.g. 10s if not found)
          <div className={`w-full h-full flex flex-col items-center justify-center border-2 rounded-xl ${borderClass} ${bgClass}`}>
            <span className="font-black text-2xl" style={{ color: cardBorderColor }}>{getCardLabel()}</span>
            <span className="text-xs opacity-50">{SUIT_ICONS[card.suit]}</span>
          </div>
        )}
      </div>

      {selected && (
        <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-amber-400 text-white rounded-full p-1 shadow-lg border-2 border-white">
            <i className="fa-solid fa-check text-xs"></i>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
