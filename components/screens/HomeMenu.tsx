
import React from 'react';
import { GameMode } from '../../game/core/types';

interface HomeMenuProps {
    onSelectMode: (mode: GameMode) => void;
    onOpenRules: () => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({ onSelectMode, onOpenRules }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 md:p-8 text-center bg-white overflow-y-auto custom-scrollbar relative">

            <div className="relative z-10 w-full max-w-6xl flex flex-col items-center pt-8 md:pt-0 pb-12 md:pb-0">
                {/* Logo Replacement */}
                <div className="mb-10 md:mb-16">
                    <img
                        src="/assets/logo/logo.svg"
                        alt="Tricktakers Logo"
                        className="h-24 md:h-40 w-auto drop-shadow-2xl"
                    />
                </div>


                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">

                    {/* BASIC MODE */}
                    <button
                        onClick={() => onSelectMode(GameMode.BASIC)}
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full max-w-xs mx-auto md:max-w-none"
                    >
                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-500 group-hover:scale-105">
                            {/* Mobile Image */}
                            <img
                                src="/assets/hp-assets/basico-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo Básico"
                            />
                            {/* Desktop Image */}
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
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full max-w-xs mx-auto md:max-w-none"
                    >
                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-500 group-hover:scale-105">
                            {/* Mobile Image */}
                            <img
                                src="/assets/hp-assets/avanzado-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo Avanzado"
                            />
                            {/* Desktop Image */}
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
                        className="group relative aspect-[186/129] md:aspect-[578/832] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full max-w-xs mx-auto md:max-w-none"
                    >
                        <div className="absolute inset-0 bg-slate-900  transition-transform duration-500 group-hover:scale-105">
                            {/* Mobile Image */}
                            <img
                                src="/assets/hp-assets/all-star-mob.jpg"
                                className="w-full h-full object-cover md:hidden opacity-90 group-hover:opacity-100 transition-opacity"
                                alt="Modo All-Star"
                            />
                            {/* Desktop Image */}
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
                <div className="mt-8 md:mt-16">
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
                {/* Left Group */}
                <img src="/assets/chars-no-bg/1A-no-bg.png" className="absolute -bottom-10 -left-10 h-full object-contain opacity-30 blur-[1px] transform -scale-x-100" />
                <img src="/assets/chars-no-bg/5C-no-bg.png" className="absolute -bottom-20 left-[10%] h-[120%] object-contain opacity-40" />

                {/* Right Group */}
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
