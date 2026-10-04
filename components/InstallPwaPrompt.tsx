import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export const InstallPwaPrompt: React.FC = () => {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Detect if already installed/running in standalone PWA mode
        const isStandaloneMode = 
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true ||
            document.referrer.includes('android-app://');

        setIsStandalone(isStandaloneMode);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isAppleDevice);

        // Listen for native Android/Desktop install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsStandalone(true);
            setDeferredPrompt(null);
        };
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    // Don't render if already installed as app or dismissed
    if (isStandalone || dismissed) {
        return null;
    }

    // Android/Desktop trigger
    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else if (isIOS) {
            setShowIOSModal(true);
        } else {
            // General fallback
            alert(t('home.fallbackInstallAlert'));
        }
    };

    return (
        <>
            {/* Banner elegante y llamativo */}
            <div className="w-full max-w-4xl mb-4 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-3.5 sm:p-4 rounded-2xl md:rounded-3xl shadow-xl border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
                    <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0 shadow-inner">
                        <i className="fa-solid fa-mobile-screen-button text-teal-400 text-xl"></i>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-sm sm:text-base text-teal-300 uppercase tracking-wide">
                                {t('home.installApp')}
                            </span>
                            <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                {isIOS ? 'iOS' : 'Android'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                            {t('home.installPromptDesc')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-download"></i>
                        <span>{t('home.installBtn')}</span>
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors shrink-0"
                        title={t('home.dismiss')}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            {/* Modal de instrucciones para iOS / Safari */}
            {showIOSModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-teal-500/40 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative text-left">
                        <button
                            onClick={() => setShowIOSModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
                                <i className="fa-brands fa-apple text-teal-400 text-2xl"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase text-teal-300 tracking-wide">
                                    {t('home.iosInstallTitle')}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">{t('home.iosInstallSubtitle')}</p>
                            </div>
                        </div>

                        <div className="space-y-4 my-6 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    1
                                </div>
                                <div className="text-xs text-slate-200">
                                    {t('home.iosStep1')}{' '}
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-700 rounded-md text-teal-400 ml-1">
                                        <i className="fa-solid fa-arrow-up-from-bracket"></i>
                                    </span>
                                </div>
                            </div>

                            <div className="w-full h-px bg-slate-700/60"></div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    2
                                </div>
                                <div className="text-xs text-slate-200">
                                    {t('home.iosStep2')}{' '}
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-700 rounded-md text-teal-400 ml-1">
                                        <i className="fa-regular fa-square-plus"></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowIOSModal(false)}
                            className="w-full py-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl transition-all"
                        >
                            {t('home.iosGotIt')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
