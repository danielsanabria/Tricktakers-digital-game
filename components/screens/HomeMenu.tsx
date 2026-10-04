import React from 'react';
import { GameMode, AIDifficulty } from '../../game/core/types';

interface HomeMenuProps {
    onSelectMode: (mode: GameMode) => void;
    onOpenRules: () => void;
    onOpenMultiplayer?: () => void;
    onRejoinRoom?: (roomCode: string) => void;
    aiDifficulty?: AIDifficulty;
    onSelectDifficulty?: (difficulty: AIDifficulty) => void;
    playerCount?: number;
    onSelectPlayerCount?: (count: number) => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({
    onSelectMode,
    onOpenRules,
    onOpenMultiplayer,
    onRejoinRoom,
    aiDifficulty = AIDifficulty.INTERMEDIATE,
    onSelectDifficulty,
    playerCount = 3,
    onSelectPlayerCount
}) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 md:p-8 text-center bg-white overflow-y-auto custom-scrollbar relative">

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center pt-2 md:pt-4 pb-12 md:pb-8">

                {/* Configuration Controls Bar - Board Game Setup Tablet */}
                <div className="w-full max-w-4xl mb-5 sm:mb-6 bg-[#FCFAF6]/95 backdrop-blur-sm border-2 border-[#E7DFD0] rounded-2xl md:rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    {/* Player Count Selector */}
                    {onSelectPlayerCount && (
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
                            <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-[#7D7060] flex items-center gap-1.5 shrink-0">
                                <i className="fa-solid fa-users text-[#A09382] text-xs"></i>
                                Jugadores en Mesa
                            </span>
                            <div className="inline-flex p-1 bg-[#EFE9DC]/80 rounded-xl border border-[#DFD7C7] w-full sm:w-auto justify-center">
                                {[2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => onSelectPlayerCount(num)}
                                        className={`flex-1 sm:flex-initial min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95 ${
                                            playerCount === num
                                                ? 'bg-[#23272E] text-[#FBF8F2] shadow-sm border border-[#3E4550]'
                                                : 'text-[#6B6154] hover:text-[#23272E] hover:bg-[#FAF6EE]'
                                        }`}
                                    >
                                        {num} P
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Difficulty Selector */}
                    {onSelectDifficulty && (
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-[#7D7060] flex items-center gap-1.5 shrink-0">
                                <i className="fa-solid fa-chess text-[#A09382] text-xs"></i>
                                Nivel Rivales (IA)
                            </span>
                            <div className="inline-flex p-1 bg-[#EFE9DC]/80 rounded-xl border border-[#DFD7C7] w-full sm:w-auto justify-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onSelectDifficulty(AIDifficulty.BEGINNER)}
                                    className={`flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                                        aiDifficulty === AIDifficulty.BEGINNER
                                            ? 'bg-[#3E6B52] text-white shadow-sm'
                                            : 'text-[#6B6154] hover:text-[#23272E] hover:bg-[#FAF6EE]'
                                    }`}
                                >
                                    <i className="fa-solid fa-seedling text-[11px]"></i>
                                    Fácil
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSelectDifficulty(AIDifficulty.INTERMEDIATE)}
                                    className={`flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                                        aiDifficulty === AIDifficulty.INTERMEDIATE
                                            ? 'bg-[#B88222] text-white shadow-sm'
                                            : 'text-[#6B6154] hover:text-[#23272E] hover:bg-[#FAF6EE]'
                                    }`}
                                >
                                    <i className="fa-solid fa-chess text-[11px]"></i>
                                    Medio
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSelectDifficulty(AIDifficulty.EXPERT)}
                                    className={`flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                                        aiDifficulty === AIDifficulty.EXPERT
                                            ? 'bg-[#6B3E7A] text-white shadow-sm'
                                            : 'text-[#6B6154] hover:text-[#23272E] hover:bg-[#FAF6EE]'
                                    }`}
                                >
                                    <i className="fa-solid fa-crown text-[11px]"></i>
                                    Experto
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Multiplayer Online Banner Button - Grand Tournament Hall */}
                {onOpenMultiplayer && (
                    <div className="w-full max-w-4xl mb-6">
                        <button
                            type="button"
                            onClick={onOpenMultiplayer}
                            className="w-full p-4 sm:p-5 rounded-2xl md:rounded-3xl bg-[#1C222B] hover:bg-[#252C37] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-300 border-2 border-[#C59B27]/70 hover:border-[#E5B842] group relative overflow-hidden text-left"
                        >
                            {/* Subtle warm gold aura & decorative depth */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#C59B27]/12 via-transparent to-[#C59B27]/5 pointer-events-none"></div>
                            <div className="absolute -right-10 -top-10 w-36 h-36 bg-[#C59B27]/10 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#C59B27]/25 to-[#C59B27]/10 border border-[#D4AF37]/40 text-[#E5B842] flex items-center justify-center text-xl sm:text-2xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                                    <i className="fa-solid fa-crown"></i>
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-black text-lg sm:text-xl uppercase tracking-wider text-[#FAF7F0]">
                                            Multijugador Online
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-[#C59B27]/20 text-[#E5B842] border border-[#C59B27]/40 font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
                                            Lobby en Vivo
                                        </span>
                                    </div>
                                    <p className="text-[#C8C2B5] text-xs sm:text-sm font-medium mt-0.5">
                                        Crea una sala privada o únete mediante código PIN (2 a 4 jugadores)
                                    </p>
                                </div>
                            </div>

                            <div className="self-stretch sm:self-auto flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#E5B842] hover:to-[#D4AF37] text-[#1C222B] px-5 py-2.5 sm:py-3 rounded-full shadow-md group-hover:shadow-[#C59B27]/30 transition-all relative z-10 shrink-0">
                                <span>Entrar al Lobby</span>
                                <i className="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-0.5 transition-transform"></i>
                            </div>
                        </button>
                    </div>
                )}

                {/* Quick Rejoin if saved room */}
                {(() => {
                    const savedRoom = typeof window !== 'undefined' ? localStorage.getItem('tricktakers_last_room') : null;
                    if (!savedRoom || !onRejoinRoom) return null;
                    return (
                        <div className="w-full max-w-4xl mb-6 -mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => onRejoinRoom(savedRoom)}
                                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#FCFAF6] text-[#23272E] border-2 border-[#C59B27]/50 rounded-full text-xs font-black hover:bg-[#F4EEDF] hover:border-[#C59B27] transition-all shadow-sm flex items-center gap-2 group active:scale-95"
                            >
                                <i className="fa-solid fa-arrow-rotate-right text-[#C59B27] text-xs group-hover:rotate-180 transition-transform"></i>
                                <span>Reunirse a la Sala</span>
                                <strong className="text-[#966E0F] font-mono tracking-widest bg-[#EFE5CD] px-2 py-0.5 rounded-md">{savedRoom}</strong>
                            </button>
                        </div>
                    );
                })()}

                {/* Local Modes Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">

                    {/* BASIC MODE */}
                    <button
                        onClick={() => onSelectMode(GameMode.BASIC)}
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 w-full max-w-md md:max-w-none mx-auto rounded-2xl md:rounded-3xl border border-stone-200/50"
                    >
                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-500 group-hover:scale-105">
                            <img
                                src="/assets/hp-assets/basico-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-95 group-hover:opacity-100 transition-opacity"
                                alt="Modo Básico"
                            />
                            <img
                                src="/assets/hp-assets/basico-desk.jpg"
                                className="hidden md:block w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                                alt="Modo Básico"
                            />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-black/10 group-hover:bg-transparent transition-colors">
                            <h4 className="text-white font-black text-2xl md:text-3xl uppercase tracking-wider mb-1.5 drop-shadow-md">
                                Básico
                            </h4>
                            <p className="text-stone-100 text-xs md:text-sm font-medium leading-snug sm:leading-relaxed px-4 sm:px-8 opacity-95 drop-shadow-sm">
                                Personajes iniciales recomendados para aprender las mecánicas.
                            </p>
                        </div>
                    </button>

                    {/* ADVANCED MODE */}
                    <button
                        onClick={() => onSelectMode(GameMode.ADVANCED)}
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 w-full max-w-md md:max-w-none mx-auto rounded-2xl md:rounded-3xl border border-stone-200/50"
                    >
                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-500 group-hover:scale-105">
                            <img
                                src="/assets/hp-assets/avanzado-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-95 group-hover:opacity-100 transition-opacity"
                                alt="Modo Avanzado"
                            />
                            <img
                                src="/assets/hp-assets/avanzado-desk.jpg"
                                className="hidden md:block w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                                alt="Modo Avanzado"
                            />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-black/10 group-hover:bg-transparent transition-colors">
                            <h4 className="text-white font-black text-2xl md:text-3xl uppercase tracking-wider mb-1.5 drop-shadow-md">
                                Avanzado
                            </h4>
                            <p className="text-stone-100 text-xs md:text-sm font-medium leading-snug sm:leading-relaxed px-4 sm:px-8 opacity-95 drop-shadow-sm">
                                Pool dinámico con personajes de la expansión y nuevas estrategias.
                            </p>
                        </div>
                    </button>

                    {/* ALL-STAR MODE */}
                    <button
                        onClick={() => onSelectMode(GameMode.ALL_STAR)}
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 w-full max-w-md md:max-w-none mx-auto rounded-2xl md:rounded-3xl border border-stone-200/50"
                    >
                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-500 group-hover:scale-105">
                            <img
                                src="/assets/hp-assets/all-star-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-95 group-hover:opacity-100 transition-opacity"
                                alt="Modo All-Star"
                            />
                            <img
                                src="/assets/hp-assets/all-star-desk.jpg"
                                className="hidden md:block w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                                alt="Modo All-Star"
                            />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-black/10 group-hover:bg-transparent transition-colors">
                            <h4 className="text-white font-black text-2xl md:text-3xl uppercase tracking-wider mb-1.5 drop-shadow-md">
                                All-Star
                            </h4>
                            <p className="text-stone-100 text-xs md:text-sm font-medium leading-snug sm:leading-relaxed px-4 sm:px-8 opacity-95 drop-shadow-sm">
                                Caos total. Todos los personajes disponibles desde el inicio.
                            </p>
                        </div>
                    </button>

                </div>

                {/* Rulebooks Button */}
                <div className="mt-8 md:mt-10">
                    <button
                        onClick={onOpenRules}
                        className="px-7 py-3.5 sm:px-8 sm:py-4 bg-[#FCFAF6] border-2 border-[#D8CFBC] rounded-full text-[#6B5E4F] font-black uppercase text-xs tracking-[0.2em] hover:bg-[#23272E] hover:text-[#FCFAF6] hover:border-[#23272E] active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-3 mx-auto"
                    >
                        <i className="fa-solid fa-book-open text-[#C59B27]"></i> Manuales de Juego
                    </button>
                </div>
            </div>

            {/* Character Illustrations Footer */}
            <div className="fixed bottom-0 left-0 w-full h-[30vh] md:h-[40vh] pointer-events-none z-0 overflow-hidden hidden md:block">
                <img src="/assets/chars-no-bg/1A-no-bg.png" className="absolute -bottom-10 -left-10 h-full object-contain opacity-30 blur-[1px] transform -scale-x-100" />
                <img src="/assets/chars-no-bg/5C-no-bg.png" className="absolute -bottom-20 left-[10%] h-[120%] object-contain opacity-40" />
                <img src="/assets/chars-no-bg/5A-no-bg.png" className="absolute -bottom-10 -right-10 h-full object-contain opacity-30 blur-[1px]" />
                <img src="/assets/chars-no-bg/5B-no-bg.png" className="absolute -bottom-16 right-[10%] h-[110%] object-contain opacity-40 ml-auto" />
            </div>

            {/* Mobile Footer Decor */}
            <div className="md:hidden -mt-4 w-full flex justify-center opacity-40 pointer-events-none overflow-hidden">
                <img src="/assets/chars-no-bg/1A-no-bg.png" className="h-[280px] object-contain -ml-16 transform translate-y-10" />
                <img src="/assets/chars-no-bg/5A-no-bg.png" className="h-[280px] object-contain -mr-16 transform translate-y-10" />
            </div>

        </div>
    );
};
