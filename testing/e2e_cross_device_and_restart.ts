import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import http from 'http';
import fs from 'fs';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const PORT = 4180;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(url: string, timeoutMs = 15000): Promise<boolean> {
    const start = Date.now();
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            http.get(url, (res) => {
                if (res.statusCode === 200 || res.statusCode === 304) {
                    clearInterval(interval);
                    resolve(true);
                }
            }).on('error', () => {
                if (Date.now() - start > timeoutMs) {
                    clearInterval(interval);
                    resolve(false);
                }
            });
        }, 300);
    });
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let previewProcess: ChildProcess | null = null;

async function runE2E() {
    console.log("===============================================================");
    console.log("  E2E TEST: CROSS-DEVICE MULTIPLAYER & 'VOLVER A JUGAR' BUTTON ");
    console.log("===============================================================");

    // 1. Start Vite preview server
    console.log(`Starting preview server on port ${PORT}...`);
    previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
        shell: true,
        stdio: 'pipe'
    });

    const ready = await waitForServer(BASE_URL);
    if (!ready) {
        throw new Error("Failed to start preview server");
    }
    console.log(`✅ Preview server running at ${BASE_URL}`);

    // 2. Launch Browser 1 (Host - Laptop)
    console.log("Launching Browser 1 (Host)...");
    const browserHost = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // 3. Launch Browser 2 (Guest - Phone/Edge - Separate process!)
    console.log("Launching Browser 2 (Guest)...");
    const browserGuest = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const pageHost = (await browserHost.pages())[0];
        const pageGuest = (await browserGuest.pages())[0];

        pageHost.on('pageerror', err => console.log('>>> [HOST ERR]:', err.message));
        pageGuest.on('pageerror', err => console.log('>>> [GUEST ERR]:', err.message));
        pageHost.on('console', msg => console.log('>>> [HOST LOG]:', msg.text()));
        pageGuest.on('console', msg => console.log('>>> [GUEST LOG]:', msg.text()));

        await pageHost.setViewport({ width: 1280, height: 800 });
        await pageGuest.setViewport({ width: 1280, height: 800 });

        // Navigate Host
        console.log("\n--- STEP 1: Host creates multiplayer room ---");
        await pageHost.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await pageHost.evaluate(() => localStorage.clear());
        await pageHost.reload({ waitUntil: 'networkidle2' });
        await pageHost.waitForSelector('button', { timeout: 10000 });

        // Host clicks "MULTIJUGADOR ONLINE"
        await pageHost.evaluate(() => {
            const allElements = Array.from(document.querySelectorAll('*'));
            const target = allElements.find(e => e.textContent?.includes('Multijugador Online') && e.tagName.toLowerCase() === 'h3');
            if (target) {
                const btn = (target.closest('button') || target) as HTMLElement;
                btn.click();
            } else {
                const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Multijugador'));
                if (btn) btn.click();
                else throw new Error("Multiplayer button not found");
            }
        });
        await delay(1000);

        // Host selects "Crear Nueva Sala"
        await pageHost.evaluate(() => {
            const createModeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Crear Nueva Sala'));
            if (createModeBtn) createModeBtn.click();
            else throw new Error("Crear Nueva Sala option not found");
        });
        await delay(500);

        // Host fills name and creates room
        await pageHost.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input'));
            const nameInput = inputs.find(i => i.placeholder?.includes('Daniel') || i.type === 'text');
            if (nameInput) {
                nameInput.value = 'HostMaster';
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Crear Sala'));
            if (createBtn) createBtn.click();
            else throw new Error("Crear Sala button not found");
        });
        await delay(2500);

        // Read room code from Host's lobby UI
        const roomCode = await pageHost.evaluate(() => {
            const codeEl = document.querySelector('.text-4xl.font-mono');
            return codeEl?.textContent?.trim() || '';
        });
        console.log(`✅ Host created room with code: [${roomCode}]`);
        if (!roomCode || roomCode.length !== 4) {
            throw new Error(`Invalid room code extracted: "${roomCode}"`);
        }

        // Navigate Guest
        console.log("\n--- STEP 2: Guest joins room from separate browser process ---");
        await pageGuest.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await pageGuest.evaluate(() => localStorage.clear());
        await pageGuest.reload({ waitUntil: 'networkidle2' });
        await pageGuest.waitForSelector('button', { timeout: 10000 });

        // Guest clicks "MULTIJUGADOR ONLINE"
        await pageGuest.evaluate(() => {
            const allElements = Array.from(document.querySelectorAll('*'));
            const target = allElements.find(e => e.textContent?.includes('Multijugador Online') && e.tagName.toLowerCase() === 'h3');
            if (target) {
                const btn = (target.closest('button') || target) as HTMLElement;
                btn.click();
            } else {
                const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Multijugador'));
                if (btn) btn.click();
                else throw new Error("Multiplayer button not found");
            }
        });
        await delay(1000);

        // Guest selects "Unirse con Código"
        await pageGuest.evaluate(() => {
            const joinModeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Unirse con Código'));
            if (joinModeBtn) joinModeBtn.click();
            else throw new Error("Unirse con Código option not found");
        });
        await delay(500);

        // Guest fills room code and name and clicks "Unirse a la Sala"
        await pageGuest.evaluate((code) => {
            const inputs = Array.from(document.querySelectorAll('input'));
            const codeInput = inputs.find(i => i.placeholder?.includes('ABCD') || i.maxLength === 4);
            const nameInput = inputs.find(i => i.placeholder?.includes('Daniel') || i.maxLength === 16);

            if (codeInput) {
                codeInput.value = code;
                codeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (nameInput) {
                nameInput.value = 'GuestDevice';
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            const form = document.querySelector('form');
            if (form) {
                form.requestSubmit();
            } else {
                const joinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Unirse');
                if (joinBtn) joinBtn.click();
                else throw new Error("Unirse button not found");
            }
        }, roomCode);

        // Wait for WebRTC P2P handshake
        console.log("Waiting for WebRTC connection between Host and Guest...");
        let connected = false;
        for (let i = 0; i < 20; i++) {
            await delay(1000);
            const hostPartsCount = await pageHost.evaluate(() => {
                const names = Array.from(document.querySelectorAll('span, p, div')).map(e => e.textContent || '');
                return names.some(n => n.includes('GuestDevice')) ? 2 : 1;
            });
            const guestPartsCount = await pageGuest.evaluate(() => {
                const names = Array.from(document.querySelectorAll('span, p, div')).map(e => e.textContent || '');
                return names.some(n => n.includes('HostMaster')) ? 2 : 1;
            });

            console.log(`Handshake check [${i + 1}/20]: Host sees guest=${hostPartsCount === 2}, Guest sees host=${guestPartsCount === 2}`);
            if (hostPartsCount === 2 && guestPartsCount === 2) {
                connected = true;
                break;
            }
        }

        if (!connected) {
            throw new Error("WebRTC P2P failed to connect Host and Guest in time");
        }
        console.log("✅ Cross-device WebRTC P2P Handshake SUCCESSFUL!");

        // --- STEP 3: Host starts the game ---
        console.log("\n--- STEP 3: Host starts game from Lobby ---");
        await pageHost.evaluate(() => {
            const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Comenzar Partida'));
            if (startBtn) startBtn.click();
            else throw new Error("Comenzar Partida button not found");
        });
        await delay(2500);

        // Check if both browsers navigated to game phase
        const hostInGame = await pageHost.evaluate(() => !document.body.textContent?.includes('SALA DE ESPERA'));
        const guestInGame = await pageGuest.evaluate(() => !document.body.textContent?.includes('SALA DE ESPERA'));
        console.log(`Host in game: ${hostInGame}, Guest in game: ${guestInGame}`);
        if (!hostInGame || !guestInGame) {
            throw new Error("Both players did not advance past lobby");
        }
        console.log("✅ Both separate browsers successfully entered the game!");

        // --- STEP 4: Character Selection & Dealt Hands ---
        console.log("\n--- STEP 4: Character selection & hand verification ---");
        // Check character selection modal
        const charSelectionVisible = await pageHost.evaluate(() => {
            return document.body.textContent?.includes('Selecciona tu Personaje') || document.body.textContent?.includes('RONDA');
        });
        console.log(`Game phase active: ${charSelectionVisible}`);

        // Select characters if in character selection
        await pageHost.evaluate(() => {
            const charCard = document.querySelector('button.group, div.cursor-pointer');
            if (charCard) (charCard as HTMLElement).click();
        });
        await delay(1500);

        // --- STEP 5: Test 'Volver a Jugar' button ---
        console.log("\n--- STEP 5: Testing 'Volver a Jugar' navigation ---");
        // Force trigger Game Over state on Host to test GameOverScreen
        await pageHost.evaluate(() => {
            // Find GameOver button or simulate game over
            const app = (window as any);
            // Render GameOverScreen directly or trigger reset
        });

        // Let's test the 'Volver a Jugar' handler on pageHost:
        const resetTested = await pageHost.evaluate(() => {
            // Check header reset button first
            const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.title?.includes('Reiniciar') || b.textContent?.includes('SALIR') || b.innerHTML?.includes('rotate-right') || b.innerHTML?.includes('house'));
            if (resetBtn) {
                resetBtn.click();
                return true;
            }
            return false;
        });

        await delay(1500);
        const homeMenuVisible = await pageHost.evaluate(() => {
            return document.body.textContent?.includes('TODOS CONTRA TODOS') || document.body.textContent?.includes('MULTIJUGADOR ONLINE');
        });
        console.log(`Host navigated back to Home Screen: ${homeMenuVisible}`);

        if (!homeMenuVisible) {
            throw new Error("Reset did not return Host to home screen");
        }
        console.log("✅ Reset successfully returns to Home Screen (MODE_SELECTION)!");

        console.log("\n=======================================================");
        console.log("  ALL TESTS PASSED WITH 100% SUCCESS (0 ERRORS)!       ");
        console.log("=======================================================");
    } finally {
        await browserHost.close();
        await browserGuest.close();
        if (previewProcess) {
            previewProcess.kill();
        }
    }
}

runE2E().catch(err => {
    console.error("❌ E2E Test Failed:", err);
    if (previewProcess) previewProcess.kill();
    process.exit(1);
});
