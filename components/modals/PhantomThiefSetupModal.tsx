
import React, { useState } from 'react';

interface PhantomThiefSetupModalProps {
    onConfirm: (chipValue: number) => void;
}

export const PhantomThiefSetupModal: React.FC<PhantomThiefSetupModalProps> = ({ onConfirm }) => {
    // 3. Phantom Chip: Set to 0 or +/- 1
    const [chip, setChip] = useState<number>(0);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-slate-500 rounded-xl max-w-lg w-full p-8 shadow-2xl relative">
                {/* Header Image */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-gray-900 overflow-hidden shadow-xl bg-gray-800">
                    <img src="/assets/chars/5C.png" alt="Phantom Thief" className="w-full h-full object-cover" />
                </div>

                <h2 className="text-3xl font-bold text-center mt-12 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-white">
                    Preparación del Golpe
                </h2>
                <p className="text-gray-400 text-center text-sm mb-8">
                    Has enviado los <strong>Avisos Previos</strong> a tus objetivos. <br />
                    Tu <strong>Socio</strong> ya tiene la carta señalada.
                </p>

                {/* Chip Selection */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 text-center">Configura tu Chip de Predicción</h3>
                    <div className="flex justify-center gap-6">
                        <button
                            onClick={() => setChip(0)}
                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all ${chip === 0 ? 'border-blue-500 bg-blue-900/50 text-white scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-gray-600 bg-gray-800 text-gray-500 hover:border-gray-500'}`}
                        >
                            0
                        </button>
                        <button
                            onClick={() => setChip(1)}
                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all ${chip === 1 ? 'border-purple-500 bg-purple-900/50 text-white scale-110 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'border-gray-600 bg-gray-800 text-gray-500 hover:border-gray-500'}`}
                        >
                            ±1
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-3">
                        {chip === 0
                            ? "Robas si tienes IGUAL número de victorias que tu objetivo."
                            : "Robas si tienes UNA victoria de DIFERENCIA con tu objetivo."}
                    </p>
                </div>

                <button
                    onClick={() => onConfirm(chip)}
                    className="w-full btn btn-slate py-3 text-lg shadow-lg font-bold tracking-widest hover:bg-slate-700"
                >
                    INICIAR EL GOLPE
                </button>
            </div>
        </div>
    );
};
