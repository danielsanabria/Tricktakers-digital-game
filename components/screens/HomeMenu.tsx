import React from 'react';
import { GameMode, AIDifficulty } from '../../game/core/types';

interface HomeMenuProps {
    onSelectMode: (mode: GameMode) => void;
    onOpenRules: () => void;
    onOpenMultiplayer?: () => void;
    aiDifficulty?: AIDifficulty;
    onSelectDifficulty?: (difficulty: AIDifficulty) => void;
    playerCount?: number;
    onSelectPlayerCount?: (count: number) => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({
    onSelectMode,
    onOpenRules,
    onOpenMultiplayer,
    aiDifficulty = AIDifficulty.INTERMEDIATE,
    onSelectDifficulty,
    playerCount = 3,
    onSelectPlayerCount
}) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 md:p-8 text-center bg-white overflow-y-auto custom-scrollbar relative">

            <div className="relative z-10 w-full max-w-6xl flex flex-col items-center pt-8 md:pt-0 pb-12 md:pb-0">
                {/* Logo Replacement */}
                <div className="mb-6 md:mb-8">
                    <img
                        src="/assets/logo/logo.svg"
                        alt="Tricktakers Logo"
                        className="h-20 md:h-36 w-auto drop-shadow-2xl"
                    />
                </div>

                {/* Configuration Controls Bar */}
                <div className="mb-8 flex flex-wrap gap-4 items-center justify-center max-w-2xl">
                    {/* Player Count Selector */}
                    {onSelectPlayerCount && (
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
                                Jugadores en Mesa
                            </span>
                            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                                {[2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => onSelectPlayerCount(num)}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                                            playerCount === num
                                                ? 'bg-slate-900 text-white shadow-md'
                                                : 'text-slate-600 hover:text-slate-900'
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
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
                                Nivel Rivales (IA)
                            </span>
                            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => onSelectDifficulty(AIDifficulty.BEGINNER)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        aiDifficulty === AIDifficulty.BEGINNER
                                            ? 'bg-emerald-500 text-white shadow-md'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <i className="fa-solid fa-seedling"></i>
                                    Fácil
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSelectDifficulty(AIDifficulty.INTERMEDIATE)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        aiDifficulty === AIDifficulty.INTERMEDIATE
                                            ? 'bg-amber-500 text-white shadow-md'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <i className="fa-solid fa-chess"></i>
                                    Medio
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSelectDifficulty(AIDifficulty.EXPERT)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        aiDifficulty === AIDifficulty.EXPERT
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <i className="fa-solid fa-brain"></i>
                                    Experto
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Multiplayer Online Banner Button */}
                {onOpenMultiplayer && (
                    <div className="w-full max-w-5xl mb-6">
                        <button
                            type="button"
                            onClick={onOpenMultiplayer}
                            className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white flex items-center justify-between shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-teal-400/40 group"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-globe"></i>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight">
                                            Multijugador Online
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full bg-white text-teal-700 font-black text-[10px] uppercase tracking-wider shadow-sm">
                                            En Tiempo Real
                                        </span>
                                    </div>
                                    <p className="text-teal-50 text-xs sm:text-sm font-medium mt-0.5 opacity-90">
                                        Crea una sala o únete con un código PIN (2 a 4 jugadores)
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 font-black text-xs uppercase tracking-wider bg-white/10 px-4 py-2 rounded-full border border-white/20">
                                Entrar al Lobby <i className="fa-solid fa-arrow-right"></i>
                            </div>
                        </button>
                    </div>
                )}

                {/* Local Modes Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">

                    {/* BASIC MODE */}
                    <button
                        onClick={() => onSelectMode(GameMode.BASIC)}
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full max-w-xs mx-auto md:max-w-none rounded-2xl"
                    >
                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-500 group-hover:scale-105">
                            <img
                                src="/assets/hp-assets/basico-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo Básico"
                            />
                            <img
                                src="/assets/hp-assets/basico-desk.jpg"
                                className="hidden md:block w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo Básico"
                            />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <h4 className="text-white font-bold text-2xl md:text-3xl uppercase tracking-tight mb-2 ">
                                Básico
                            </h4>
                            <p className="text-slate-200 text-xs md:text-sm font-regular leading-relaxed pl-8 pr-8 opacity-90">
                                Personajes iniciales recomendados para aprender las mecánicas.
                            </p>
                        </div>
                    </button>

                    {/* ADVANCED MODE */}
                    <button
                        onClick={() => onSelectMode(GameMode.ADVANCED)}
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full max-w-xs mx-auto md:max-w-none rounded-2xl"
                    >
                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-500 group-hover:scale-105">
                            <img
                                src="/assets/hp-assets/avanzado-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo Avanzado"
                            />
                            <img
                                src="/assets/hp-assets/avanzado-desk.jpg"
                                className="hidden md:block w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo Avanzado"
                            />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <h4 className="text-white font-bold text-2xl md:text-3xl  uppercase tracking-tight mb-2">
                                Avanzado
                            </h4>
                            <p className="text-slate-200 text-xs md:text-sm font-regular pl-8 pr-8 leading-relaxed opacity-90">
                                Pool dinámico con personajes de la expansión y nuevas estrategias.
                            </p>
                        </div>
                    </button>

                    {/* ALL-STAR MODE */}
                    <button
                        onClick={() => onSelectMode(GameMode.ALL_STAR)}
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full max-w-xs mx-auto md:max-w-none rounded-2xl"
                    >
                        <div className="absolute inset-0 bg-slate-900  transition-transform duration-500 group-hover:scale-105">
                            <img
                                src="/assets/hp-assets/all-star-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo All-Star"
                            />
                            <img
                                src="/assets/hp-assets/all-star-desk.jpg"
                                className="hidden md:block w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo All-Star"
                            />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <h4 className="text-white font-bold text-2xl md:text-3xl uppercase tracking-tight mb-2 drop-shadow-md">
                                All-Star
                            </h4>
                            <p className="text-slate-200 text-xs md:text-sm font-regular pl-8 pr-8 leading-relaxed opacity-90">
                                Caos total. Todos los personajes disponibles desde el inicio.
                            </p>
                        </div>
                    </button>

                </div>

                {/* Rulebooks Button */}
                <div className="mt-8 md:mt-12">
                    <button
                        onClick={onOpenRules}
                        className="px-8 py-4 bg-white border-2 border-slate-200 rounded-full text-slate-500 font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-lg flex items-center gap-3 mx-auto"
                    >
                        <i className="fa-solid fa-book-open"></i> Manuales de Juego
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
