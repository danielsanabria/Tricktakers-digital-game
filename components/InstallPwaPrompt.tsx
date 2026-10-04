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
        // Check local persistence for dismissed state
        const dismissedSaved = typeof window !== 'undefined' && localStorage.getItem('tricktakers_pwa_dismissed') === 'true';
        if (dismissedSaved) {
            setDismissed(true);
        }

        // Check local persistence for installed state
        const installedSaved = typeof window !== 'undefined' && localStorage.getItem('tricktakers_pwa_installed') === 'true';

        // Detect if already installed / running in standalone PWA mode
        const isStandaloneMode = 
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true ||
            document.referrer.includes('android-app://') ||
            installedSaved;

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
            try {
                localStorage.setItem('tricktakers_pwa_installed', 'true');
            } catch (e) {
                // Ignore storage errors
            }
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

    const handleDismiss = () => {
        setDismissed(true);
        try {
            localStorage.setItem('tricktakers_pwa_dismissed', 'true');
        } catch (e) {
            // Ignore storage errors
        }
    };

    // Android/Desktop trigger
    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsStandalone(true);
                try {
                    localStorage.setItem('tricktakers_pwa_installed', 'true');
                } catch (e) {
                    // Ignore storage errors
                }
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
            {/* Banner con el estilo y paleta de Multijugador Online (Slate oscuro + Oro cálido) */}
            <div className="w-full max-w-4xl my-4 sm:my-6 rounded-2xl md:rounded-3xl bg-[#1C222B] text-white p-4 sm:p-5 shadow-xl border-2 border-[#C59B27]/70 hover:border-[#E5B842] relative overflow-hidden transition-all duration-300 text-left">
                {/* Aura dorada sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#C59B27]/12 via-transparent to-[#C59B27]/5 pointer-events-none"></div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#C59B27]/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#C59B27]/25 to-[#C59B27]/10 border border-[#D4AF37]/40 text-[#E5B842] flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
                            <i className="fa-solid fa-mobile-screen-button"></i>
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-black text-base sm:text-lg uppercase tracking-wider text-[#FAF7F0]">
                                    {t('home.installApp')}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full bg-[#C59B27]/20 text-[#E5B842] border border-[#C59B27]/40 font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
                                    {isIOS ? 'iOS' : 'Android'}
                                </span>
                            </div>
                            <p className="text-[#C8C2B5] text-xs sm:text-sm font-medium mt-0.5">
                                {t('home.installPromptDesc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
                        <button
                            onClick={handleInstallClick}
                            type="button"
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#E5B842] hover:to-[#D4AF37] active:scale-95 text-[#1C222B] px-5 py-3 rounded-full shadow-md transition-all cursor-pointer"
                        >
                            <i className="fa-solid fa-download text-xs"></i>
                            <span>{t('home.installBtn')}</span>
                        </button>
                        <button
                            onClick={handleDismiss}
                            type="button"
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-[#C8C2B5] hover:text-white flex items-center justify-center text-xs transition-colors shrink-0 border border-white/10 active:scale-95 cursor-pointer"
                            title={t('home.dismiss')}
                        >
                            <i className="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de instrucciones para iOS / Safari con colores del juego */}
            {showIOSModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#1C222B] border-2 border-[#C59B27]/60 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative text-left">
                        <button
                            onClick={() => setShowIOSModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center text-sm transition-colors"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C59B27]/25 to-[#C59B27]/10 border border-[#D4AF37]/40 text-[#E5B842] flex items-center justify-center shrink-0">
                                <i className="fa-brands fa-apple text-2xl"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase text-[#FAF7F0] tracking-wide">
                                    {t('home.iosInstallTitle')}
                                </h3>
                                <p className="text-xs text-[#C8C2B5] font-medium">{t('home.iosInstallSubtitle')}</p>
                            </div>
                        </div>

                        <div className="space-y-4 my-6 bg-[#252C37]/80 p-4 rounded-2xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#1C222B] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    1
                                </div>
                                <div className="text-xs text-[#FAF7F0]">
                                    {t('home.iosStep1')}{' '}
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-[#1C222B] border border-white/20 rounded-md text-[#E5B842] ml-1">
                                        <i className="fa-solid fa-arrow-up-from-bracket"></i>
                                    </span>
                                </div>
                            </div>

                            <div className="w-full h-px bg-white/10"></div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#1C222B] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    2
                                </div>
                                <div className="text-xs text-[#FAF7F0]">
                                    {t('home.iosStep2')}{' '}
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-[#1C222B] border border-white/20 rounded-md text-[#E5B842] ml-1">
                                        <i className="fa-regular fa-square-plus"></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setShowIOSModal(false);
                                try {
                                    localStorage.setItem('tricktakers_pwa_installed', 'true');
                                } catch (e) {}
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#E5B842] hover:to-[#D4AF37] text-[#1C222B] font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition-all"
                        >
                            {t('home.iosGotIt')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
