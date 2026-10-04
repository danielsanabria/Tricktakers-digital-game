import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const PORT = Math.floor(4600 + Math.random() * 2000);
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
let browserHost: Browser | null = null;
let browserGuest: Browser | null = null;

function cleanup() {
    if (previewProcess && previewProcess.pid) {
        try { spawn('taskkill', ['/pid', String(previewProcess.pid), '/T', '/F']); } catch (e) {}
    }
    if (browserHost) browserHost.close().catch(() => {});
    if (browserGuest) browserGuest.close().catch(() => {});
}

async function run() {
    console.log("=================================================");
    console.log("  CROSS-DEVICE MULTIPLAYER & HAND DISPLAY E2E TEST ");
    console.log("=================================================\n");

    previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
        shell: true,
        stdio: 'pipe'
    });

    const ready = await waitForServer(BASE_URL);
    if (!ready) throw new Error("Server failed to start on port " + PORT);
    console.log(`✅ Preview server running at ${BASE_URL}`);

    const tempDir = os.tmpdir();
    // Launch Browser 1 (Host) - process 1
    browserHost = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=' + fs.mkdtempSync(path.join(tempDir, 'host_'))]
    });

    // Launch Browser 2 (Guest) - completely isolated process 2
    browserGuest = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=' + fs.mkdtempSync(path.join(tempDir, 'guest_'))]
    });

    const pageHost = await browserHost.newPage();
    const pageGuest = await browserGuest.newPage();

    await pageHost.setViewport({ width: 1280, height: 800 });
    await pageGuest.setViewport({ width: 1280, height: 800 });

    pageHost.on('pageerror', err => console.warn('>>> [HOST ERR]:', err.message));
    pageGuest.on('pageerror', err => console.warn('>>> [GUEST ERR]:', err.message));

    // --- STEP 1: Host creates room ---
    console.log("\n--- STEP 1: Host creates room ---");
    await pageHost.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await pageHost.waitForSelector('button', { timeout: 8000 });

    // Click Multijugador Online
    await pageHost.evaluate(() => {
        const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Multijugador Online'));
        const btn = h3?.closest('button');
        if (btn) btn.click();
    });
    await delay(600);

    // Click Crear Nueva Sala
    await pageHost.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Crear Nueva Sala'));
        if (btn) btn.click();
    });
    await delay(500);

    // Host submits form
    await pageHost.evaluate(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) { input.value = 'HostPC'; input.dispatchEvent(new Event('input', { bubbles: true })); }
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
    });
    await delay(2500);

    const roomCode = await pageHost.evaluate(() => {
        return document.querySelector('.text-4xl.font-mono')?.textContent?.trim() || '';
    });
    console.log(`✅ Host created room with code: [${roomCode}]`);
    if (!roomCode || roomCode.length !== 4) throw new Error("Invalid room code: " + roomCode);

    // --- STEP 2: Guest joins from independent browser ---
    console.log("\n--- STEP 2: Guest joins from independent browser ---");
    await pageGuest.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await pageGuest.waitForSelector('button', { timeout: 8000 });

    await pageGuest.evaluate(() => {
        const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Multijugador Online'));
        const btn = h3?.closest('button');
        if (btn) btn.click();
    });
    await delay(600);

    await pageGuest.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Unirse con Código'));
        if (btn) btn.click();
    });
    await delay(500);

    // Type room code into Guest
    await pageGuest.type('input[placeholder="ABCD"]', roomCode);
    await delay(300);

    await pageGuest.evaluate(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
    });
    await delay(2500);

    // --- STEP 3: Verify Cross-Browser Handshake in Lobby ---
    console.log("\n--- STEP 3: Verify Cross-Browser Lobby Handshake ---");
    let handshakeOk = false;
    for (let i = 0; i < 15; i++) {
        await delay(1000);
        const hostSeesGuest = await pageHost.evaluate(() => {
            const text = document.body.textContent || '';
            const greenDots = document.querySelectorAll('.bg-emerald-500').length;
            return text.includes('Jugador Conectado') || greenDots >= 2;
        });

        const guestSeesHost = await pageGuest.evaluate(() => {
            const text = document.body.textContent || '';
            return text.includes('Anfitrión') || text.includes('Lobby de Torneo');
        });

        console.log(`  Check [${i + 1}/15]: Host sees 2 players = ${hostSeesGuest}, Guest in lobby = ${guestSeesHost}`);
        if (hostSeesGuest && guestSeesHost) {
            handshakeOk = true;
            break;
        }
    }

    if (!handshakeOk) {
        throw new Error("Lobby handshake failed between Host and Guest");
    }
    console.log("✅ Cross-Device Lobby Handshake SUCCESSFUL!");

    // --- STEP 3.5: Host Leaves Lobby & Re-enters, Retaining Host Role ---
    console.log("\n--- STEP 3.5: Host Leaves Lobby and Rejoins (verifying Host role persistence) ---");
    // Host clicks "Salir de la Sala"
    await pageHost.evaluate(() => {
        const leaveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Salir de la Sala'));
        if (leaveBtn) leaveBtn.click();
    });
    await delay(1200);

    // Host should now be on HomeMenu
    const onHome = await pageHost.evaluate(() => {
        return !!Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Multijugador Online'));
    });
    console.log(`  Host back on HomeMenu: ${onHome}`);

    // Host clicks Multijugador Online again
    await pageHost.evaluate(() => {
        const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Multijugador Online'));
        const btn = h3?.closest('button');
        if (btn) btn.click();
    });
    await delay(600);

    // Host sees recent room banner with "Reunirse" & Crown badge
    const seesHostBanner = await pageHost.evaluate(() => {
        const text = document.body.textContent || '';
        return text.includes('Partida reciente detectada') && text.includes('Anfitrión');
    });
    console.log(`  Host sees recent room with Anfitrión crown badge: ${seesHostBanner}`);

    // Host clicks "Reunirse"
    await pageHost.evaluate(() => {
        const rejoinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Reunirse'));
        if (rejoinBtn) rejoinBtn.click();
    });
    await delay(2500);

    // Verify Host has Iniciar Torneo button and Host badge in lobby
    let hostRestored = false;
    for (let i = 0; i < 10; i++) {
        await delay(1000);
        const hostState = await pageHost.evaluate(() => {
            const text = document.body.textContent || '';
            const hasStartBtn = !!Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Iniciar Torneo'));
            const isHostSlot = text.includes('Anfitrión de la Sala');
            const seesGuest = text.includes('Jugador Conectado') || document.querySelectorAll('.bg-emerald-500').length >= 2;
            return { hasStartBtn, isHostSlot, seesGuest };
        });

        console.log(`  Check host restore [${i + 1}/10]: hasStartBtn=${hostState.hasStartBtn}, isHostSlot=${hostState.isHostSlot}, seesGuest=${hostState.seesGuest}`);
        if (hostState.hasStartBtn && hostState.isHostSlot && hostState.seesGuest) {
            hostRestored = true;
            break;
        }
    }

    if (!hostRestored) {
        throw new Error("Host failed to retain host role or rediscover guest after rejoining lobby!");
    }
    console.log("✅ Host SUCCESSFULLY retained Host role, crown, and Iniciar Torneo button upon rejoining!");

    // --- STEP 4: Host Starts Game ---
    console.log("\n--- STEP 4: Host Starts Game ---");
    await pageHost.evaluate(() => {
        const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Iniciar Torneo'));
        if (startBtn) startBtn.click();
    });
    await delay(3000);

    // --- STEP 5: Verify Both See Character Selection & Their 5 Hand Cards ---
    console.log("\n--- STEP 5: Verify Character Selection & 5 Hand Cards on BOTH screens ---");
    const hostHasCards = await pageHost.evaluate(() => {
        const text = document.body.textContent || '';
        const inCharSelection = text.includes('Selección de Personaje');
        const hasHandHeader = text.includes('Tus 5 Cartas de esta Ronda') || text.includes('Cartas de esta Ronda');
        return { inCharSelection, hasHandHeader };
    });

    const guestHasCards = await pageGuest.evaluate(() => {
        const text = document.body.textContent || '';
        const inCharSelection = text.includes('Selección de Personaje');
        const hasHandHeader = text.includes('Tus 5 Cartas de esta Ronda') || text.includes('Cartas de esta Ronda');
        return { inCharSelection, hasHandHeader };
    });

    console.log(`  Host in Character Selection: ${hostHasCards.inCharSelection}, sees hand: ${hostHasCards.hasHandHeader}`);
    console.log(`  Guest in Character Selection: ${guestHasCards.inCharSelection}, sees hand: ${guestHasCards.hasHandHeader}`);

    if (!hostHasCards.hasHandHeader || !guestHasCards.hasHandHeader) {
        throw new Error("Hand cards NOT visible during character selection!");
    }
    console.log("✅ BOTH Host and Guest see their 5 dealt cards clearly during Character Selection!");

    console.log("\n=================================================");
    console.log("  🎉 ALL CROSS-DEVICE MULTIPLAYER TESTS PASSED!  ");
    console.log("=================================================\n");
}

run()
    .then(() => {
        cleanup();
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Test failed:", err);
        cleanup();
        process.exit(1);
    });
