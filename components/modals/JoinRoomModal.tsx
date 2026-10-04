import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

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
    const { t } = useTranslation();
    const [mode, setMode] = useState<'SELECT' | 'CREATE' | 'JOIN'>('SELECT');
    const [playerName, setPlayerName] = useState(() => {
        return localStorage.getItem('tricktakers_player_name') || ('Player ' + Math.floor(100 + Math.random() * 900));
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
            setError(t('joinModal.nameRequired'));
            return;
        }
        localStorage.setItem('tricktakers_player_name', trimmed);
        onCreateRoom(trimmed);
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = playerName.trim();
        if (!trimmedName) {
            setError(t('joinModal.nameRequired'));
            return;
        }
        if (roomCode.trim().length !== 4) {
            setError(t('joinModal.codeRequired'));
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
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FCFAF6] rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-[#E7DFD0] relative animate-in fade-in zoom-in-95 duration-200">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#EFE9DC] hover:bg-[#E5DDCB] flex items-center justify-center text-[#6B5E4F] font-bold transition-colors"
                >
                    <i className="fa-solid fa-xmark text-sm"></i>
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#C59B27]/15 border border-[#C59B27]/30 text-[#966E0F] flex items-center justify-center text-xl mx-auto mb-3 shadow-inner">
                        <i className="fa-solid fa-crown"></i>
                    </div>
                    <h3 className="text-2xl font-black text-[#23272E] uppercase tracking-tight">
                        {t('home.multiplayerTitle')}
                    </h3>
                    <p className="text-xs text-[#7D7060] mt-1 font-medium">
                        {t('home.multiplayerDesc')}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                        <i className="fa-solid fa-circle-exclamation"></i> {error}
                    </div>
                )}

                {/* Rejoin Banner if lastRoom exists */}
                {lastRoom && mode === 'SELECT' && (
                    <div className="mb-4 p-3.5 bg-[#F7F2E8] border border-[#D8CFBC] rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="text-left">
                            <span className="block text-[9px] font-black uppercase text-[#966E0F] tracking-wider">
                                {t('home.rejoinRoom')}
                            </span>
                            <span className="font-black text-sm text-[#23272E] flex items-center gap-1.5">
                                {t('lobby.roomCode')}: <span className="font-mono text-[#966E0F] font-bold">{lastRoom}</span>
                                {localStorage.getItem('tricktakers_is_host_' + lastRoom) === 'true' && (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black flex items-center gap-1 border border-amber-300">
                                        <i className="fa-solid fa-crown text-[9px]"></i> {t('common.host')}
                                    </span>
                                )}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRejoin(lastRoom)}
                            className="px-4 py-2 bg-[#23272E] text-[#FCFAF6] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#3E4550] transition-colors shadow-md flex items-center gap-1.5 active:scale-95"
                        >
                            <i className="fa-solid fa-rotate-right text-xs text-[#C59B27]"></i> {t('home.rejoinRoom')}
                        </button>
                    </div>
                )}

                {/* Mode Selector */}
                {mode === 'SELECT' && (
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => { setError(''); setMode('CREATE'); }}
                            className="p-4 rounded-2xl border-2 border-[#E7DFD0] hover:border-[#C59B27] hover:bg-[#F5EFE3] transition-all text-left flex items-center justify-between group active:scale-[0.99]"
                        >
                            <div>
                                <h4 className="font-black text-sm text-[#23272E] uppercase tracking-tight group-hover:text-[#966E0F]">
                                    {t('home.createRoom')}
                                </h4>
                                <p className="text-[11px] text-[#7D7060] mt-0.5 font-medium">
                                    {t('lobby.shareCodeHint')}
                                </p>
                            </div>
                            <i className="fa-solid fa-plus text-[#A09382] group-hover:text-[#966E0F] text-lg"></i>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setError(''); setMode('JOIN'); }}
                            className="p-4 rounded-2xl border-2 border-[#E7DFD0] hover:border-[#C59B27] hover:bg-[#F5EFE3] transition-all text-left flex items-center justify-between group active:scale-[0.99]"
                        >
                            <div>
                                <h4 className="font-black text-sm text-[#23272E] uppercase tracking-tight group-hover:text-[#966E0F]">
                                    {t('home.joinRoom')}
                                </h4>
                                <p className="text-[11px] text-[#7D7060] mt-0.5 font-medium">
                                    {t('joinModal.codePlaceholder')}
                                </p>
                            </div>
                            <i className="fa-solid fa-arrow-right-to-bracket text-[#A09382] group-hover:text-[#966E0F] text-lg"></i>
                        </button>
                    </div>
                )}

                {/* Create Room Form */}
                {mode === 'CREATE' && (
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-[#7D7060] mb-1 text-left">
                                {t('joinModal.enterName')}
                            </label>
                            <input
                                type="text"
                                maxLength={16}
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#D8CFBC] bg-white text-[#23272E] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27]"
                                placeholder={t('joinModal.namePlaceholder')}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setMode('SELECT')}
                                className="flex-1 py-3 rounded-full border border-[#D8CFBC] text-[#6B5E4F] font-bold text-xs uppercase hover:bg-[#EFE9DC] transition-colors"
                            >
                                {t('common.back')}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
                            >
                                {t('home.createRoom')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Join Room Form */}
                {mode === 'JOIN' && (
                    <form onSubmit={handleJoin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-[#7D7060] mb-1 text-left">
                                {t('joinModal.enterName')}
                            </label>
                            <input
                                type="text"
                                maxLength={16}
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#D8CFBC] bg-white text-[#23272E] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27]"
                                placeholder={t('joinModal.namePlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-[#7D7060] mb-1 text-left">
                                {t('joinModal.roomCode')} (4)
                            </label>
                            <input
                                type="text"
                                maxLength={4}
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 rounded-xl border border-[#D8CFBC] bg-white text-[#23272E] font-black text-center text-xl tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] uppercase"
                                placeholder="ABCD"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setMode('SELECT')}
                                className="flex-1 py-3 rounded-full border border-[#D8CFBC] text-[#6B5E4F] font-bold text-xs uppercase hover:bg-[#EFE9DC] transition-colors"
                            >
                                {t('common.back')}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
                            >
                                {t('home.joinRoom')}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
};
