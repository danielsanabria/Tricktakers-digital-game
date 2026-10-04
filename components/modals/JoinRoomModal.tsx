import React, { useState, useEffect } from 'react';

interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateRoom: (playerName: string) => void;
    onJoinRoom: (roomCode: string, playerName: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
    isOpen,
    onClose,
    onCreateRoom,
    onJoinRoom
}) => {
    const [mode, setMode] = useState<'SELECT' | 'CREATE' | 'JOIN'>('SELECT');
    const [playerName, setPlayerName] = useState(() => {
        return localStorage.getItem('tricktakers_player_name') || ('Jugador ' + Math.floor(100 + Math.random() * 900));
    });
    const [roomCode, setRoomCode] = useState('');
    const [lastRoom, setLastRoom] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMode('SELECT');
            setError('');
            const savedRoom = localStorage.getItem('tricktakers_last_room');
            if (savedRoom) setLastRoom(savedRoom);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = playerName.trim();
        if (!trimmed) {
            setError('Ingresa tu nombre para continuar.');
            return;
        }
        localStorage.setItem('tricktakers_player_name', trimmed);
        onCreateRoom(trimmed);
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = playerName.trim();
        if (!trimmedName) {
            setError('Ingresa tu nombre.');
            return;
        }
        if (roomCode.trim().length !== 4) {
            setError('El código de la sala debe tener 4 caracteres.');
            return;
        }
        localStorage.setItem('tricktakers_player_name', trimmedName);
        onJoinRoom(roomCode.trim().toUpperCase(), trimmedName);
    };

    const handleRejoin = (code: string) => {
        const trimmedName = playerName.trim();
        if (!trimmedName) return;
        localStorage.setItem('tricktakers_player_name', trimmedName);
        onJoinRoom(code.toUpperCase(), trimmedName);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors"
                >
                    <i className="fa-solid fa-xmark text-sm"></i>
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl mx-auto mb-3 shadow-inner">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Multijugador Online
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Juega con hasta 4 amigos en tiempo real
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                        <i className="fa-solid fa-circle-exclamation"></i> {error}
                    </div>
                )}

                {/* Rejoin Banner if lastRoom exists */}
                {lastRoom && mode === 'SELECT' && (
                    <div className="mb-4 p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="text-left">
                            <span className="block text-[9px] font-black uppercase text-teal-600 tracking-wider">
                                Partida reciente detectada
                            </span>
                            <span className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                                Sala <span className="font-mono text-teal-600 font-bold">{lastRoom}</span>
                                {localStorage.getItem('tricktakers_is_host_' + lastRoom) === 'true' && (
                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                                        <i className="fa-solid fa-crown text-[9px]"></i> Anfitrión
                                    </span>
                                )}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRejoin(lastRoom)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-teal-600 transition-colors shadow-md flex items-center gap-1.5"
                        >
                            <i className="fa-solid fa-rotate-right text-xs"></i> Reunirse
                        </button>
                    </div>
                )}

                {/* Mode Selector */}
                {mode === 'SELECT' && (
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => { setError(''); setMode('CREATE'); }}
                            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left flex items-center justify-between group"
                        >
                            <div>
                                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight group-hover:text-teal-600">
                                    Crear Nueva Sala
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Genera un código e invita hasta a 3 amigos
                                </p>
                            </div>
                            <i className="fa-solid fa-plus text-slate-300 group-hover:text-teal-500 text-lg"></i>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setError(''); setMode('JOIN'); }}
                            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left flex items-center justify-between group"
                        >
                            <div>
                                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight group-hover:text-teal-600">
                                    Unirse con Código
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Introduce el PIN de 4 letras de tu amigo
                                </p>
                            </div>
                            <i className="fa-solid fa-arrow-right-to-bracket text-slate-300 group-hover:text-teal-500 text-lg"></i>
                        </button>
                    </div>
                )}

                {/* Create Room Form */}
                {mode === 'CREATE' && (
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 text-left">
                                Tu Nombre o Apodo
                            </label>
                            <input
                                type="text"
                                maxLength={16}
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Ej: Daniel"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setMode('SELECT')}
                                className="flex-1 py-3 rounded-full border border-slate-200 text-slate-600 font-bold text-xs uppercase"
                            >
                                Atrás
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-wider hover:bg-teal-600 transition-colors shadow-md"
                            >
                                Crear Sala
                            </button>
                        </div>
                    </form>
                )}

                {/* Join Room Form */}
                {mode === 'JOIN' && (
                    <form onSubmit={handleJoin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 text-left">
                                Tu Nombre o Apodo
                            </label>
                            <input
                                type="text"
                                maxLength={16}
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Ej: Elena"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 text-left">
                                Código de la Sala (4 Letras)
                            </label>
                            <input
                                type="text"
                                maxLength={4}
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-black text-center text-xl tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                                placeholder="ABCD"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setMode('SELECT')}
                                className="flex-1 py-3 rounded-full border border-slate-200 text-slate-600 font-bold text-xs uppercase"
                            >
                                Atrás
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-wider hover:bg-teal-600 transition-colors shadow-md"
                            >
                                Unirse
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
};
