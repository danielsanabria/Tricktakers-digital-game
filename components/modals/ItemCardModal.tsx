import React from 'react';

interface ItemCardModalProps {
    imageUrl?: string | null;
    itemCardPath?: string | null;
    onClose: () => void;
}

export const ItemCardModal: React.FC<ItemCardModalProps> = ({ imageUrl, itemCardPath, onClose }) => {
    const src = imageUrl || itemCardPath;
    if (!src) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div className="relative max-w-sm w-full animate-in zoom-in duration-300">
                <img
                    src={src}
                    className="w-full rounded-2xl shadow-2xl border-4 border-slate-700"
                    alt="Item Card"
                />
                <button className="absolute -top-4 -right-4 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white border-2 border-slate-700 shadow-xl" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    );
};
