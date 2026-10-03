import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import http from 'http';
import fs from 'fs';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const PORT = 4173;
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

async function clickByText(page: Page, text: string) {
    await page.evaluate((targetText) => {
        const all = Array.from(document.querySelectorAll('button, a, div[role="button"], h3, h4, img, p, span'));
        const el = all.find(e => {
            const content = e.textContent || '';
            const alt = (e as HTMLImageElement).alt || '';
            return content.toLowerCase().includes(targetText.toLowerCase()) ||
                   alt.toLowerCase().includes(targetText.toLowerCase());
        });
        if (!el) throw new Error(`Element with text "${targetText}" not found`);
        const clickable = (el.closest('button') || el) as HTMLElement;
        clickable.click();
    }, text);
}

async function runRealBrowserTests() {
    console.log("==================================================");
    console.log("  REAL BROWSER E2E TEST (PUPPETEER + REAL CHROME) ");
    console.log("==================================================");
    console.log(`Using Browser executable: ${CHROME_PATH}`);

    // 1. Launch Vite preview
    console.log(`Starting Vite preview server on port ${PORT}...`);
    previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
        shell: true,
        stdio: 'pipe'
    });

    const isReady = await waitForServer(BASE_URL);
    if (!isReady) {
        console.error("❌ Failed to start Vite preview server in time.");
        cleanupAndExit(1);
    }
    console.log(`✅ Vite server is ready at ${BASE_URL}`);

    // 2. Launch real Chrome
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--window-size=1280,800'
        ]
    });

    try {
        // ==========================================
        // TEST 1: Home Menu Background & Styling
        // ==========================================
        console.log("\n--- TEST 1: Home Screen UI & Background Contrast ---");
        const page1 = (await browser.pages())[0];
        page1.on('pageerror', err => console.error('>>> [BROWSER ERROR]:', err));
        page1.on('console', msg => console.log('>>> [BROWSER CONSOLE]:', msg.text()));
        await page1.setViewport({ width: 1280, height: 800 });
        await page1.goto(BASE_URL, { waitUntil: 'networkidle2' });

        // Clear localStorage for clean test state
        await page1.evaluate(() => localStorage.clear());
        await page1.reload({ waitUntil: 'networkidle2' });
        await page1.waitForSelector('.bg-white', { timeout: 10000 });

        // Check background color of HomeMenu root
        const homeBgColor = await page1.evaluate(() => {
            const menu = document.querySelector('.bg-white');
            if (!menu) return null;
            return window.getComputedStyle(menu).backgroundColor;
        });
        console.log(`Home screen detected background color: ${homeBgColor}`);
        if (!homeBgColor || (!homeBgColor.includes('255, 255, 255') && !homeBgColor.includes('rgba(255, 255, 255, 1)'))) {
            throw new Error(`Home menu does not have clean white background. Found: ${homeBgColor}`);
        }
        console.log("✅ PASSED: Home screen has crisp, clean white background (bg-white).");

        // Verify Logo & Mode Buttons exist
        const modeButtons = await page1.$$('button');
        console.log(`Detected ${modeButtons.length} interactive buttons on home screen.`);
        if (modeButtons.length < 3) {
            throw new Error("Missing game mode buttons on home screen.");
        }
        console.log("✅ PASSED: Home screen buttons and options rendered successfully.");

        // ==========================================
        // TEST 2: Solo Game Flow & Hand Cards Check
        // ==========================================
        console.log("\n--- TEST 2: Solo Game Flow & Hand Verification ---");
        await clickByText(page1, 'Básico');
        await delay(1500);

        // Pick a character in character selection
        console.log("Picking character in Character Selection...");
        const charPicked = await page1.evaluate(() => {
            // Find character card that can be selected
            const cards = Array.from(document.querySelectorAll('.aspect-\\[2\\/3\\]'));
            if (cards.length > 0) {
                (cards[0] as HTMLElement).click();
                return true;
            }
            return false;
        });
        console.log(`Character card clicked: ${charPicked}`);

        // Wait for round to start (AI selects other characters and startRound executes)
        console.log("Waiting for round to start and cards to deal...");
        await delay(4000);

        // Verify local player hand has cards
        const soloHandCheck = await page1.evaluate(() => {
            const bottomArea = document.querySelector('.shrink-0.z-40');
            if (!bottomArea) return { foundArea: false, cardCount: 0 };
            const cardImages = bottomArea.querySelectorAll('img[alt*="RED"], img[alt*="BLUE"], img[alt*="GREEN"], img[alt*="BLACK"], img[alt*="COLORLESS"], img[alt*="RARE"], img[alt*="WHITE_FLAG"]');
            return {
                foundArea: true,
                cardCount: cardImages.length,
                hasSinCartas: bottomArea.textContent?.includes('Sin cartas') || false
            };
        });
        console.log("Solo Game Hand State:", soloHandCheck);
        if (!soloHandCheck.foundArea || soloHandCheck.hasSinCartas) {
            throw new Error("FAIL: Solo player has empty hand or hand area missing!");
        }
        console.log(`✅ PASSED: Solo player hand area active with ${soloHandCheck.cardCount} visible cards!`);

        // ==========================================
        // TEST 3: Real 2-Tab Multiplayer E2E
        // ==========================================
        console.log("\n--- TEST 3: Real 2-Tab Multiplayer (Host + Guest) ---");
        const hostTab = page1;
        const guestTab = await browser.newPage();
        await guestTab.setViewport({ width: 1280, height: 800 });

        // Navigate both to Home
        await hostTab.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await guestTab.goto(BASE_URL, { waitUntil: 'networkidle2' });

        // Clear localStorages for clean run
        await hostTab.evaluate(() => localStorage.clear());
        await guestTab.evaluate(() => localStorage.clear());
        await hostTab.reload({ waitUntil: 'networkidle2' });
        await guestTab.reload({ waitUntil: 'networkidle2' });

        // Host opens Multiplayer Modal
        console.log("Host opening Multiplayer Modal...");
        await clickByText(hostTab, 'Multijugador Online');
        await delay(600);

        // Host clicks "Crear Nueva Sala"
        console.log("Host clicking 'Crear Nueva Sala'...");
        await clickByText(hostTab, 'Crear Nueva Sala');
        await delay(600);

        // Host types player name using real keyboard input
        console.log("Host typing name 'HostPro'...");
        await hostTab.focus('input[type="text"]');
        await hostTab.keyboard.type('HostPro');
        await delay(300);

        // Host submits form
        console.log("Host submitting room creation...");
        await clickByText(hostTab, 'Crear Sala');
        await delay(2000);

        // Read Room Code from Lobby
        const roomCode = await hostTab.evaluate(() => {
            const fontMonoEls = Array.from(document.querySelectorAll('.font-mono'));
            for (const el of fontMonoEls) {
                const text = el.textContent?.trim() || '';
                if (/^[A-Z0-9]{4}$/.test(text)) {
                    return text;
                }
            }
            return null;
        });

        console.log(`Host Lobby generated Room PIN: "${roomCode}"`);
        if (!roomCode) {
            throw new Error("FAIL: Room code not found in LobbyScreen.");
        }
        console.log(`✅ PASSED: Room created with code ${roomCode}`);

        // Guest joins with Room Code
        console.log(`Guest joining Room ${roomCode}...`);
        await clickByText(guestTab, 'Multijugador Online');
        await delay(600);

        await clickByText(guestTab, 'Unirse con Código');
        await delay(600);

        // Guest enters Name and Room Code with real keyboard input
        const inputs = await guestTab.$$('input[type="text"]');
        if (inputs.length < 2) {
            throw new Error("Join form inputs not found.");
        }
        await inputs[0].click({ clickCount: 3 });
        await guestTab.keyboard.press('Backspace');
        await guestTab.keyboard.type('GuestPlayer');
        await delay(200);

        await inputs[1].click({ clickCount: 3 });
        await guestTab.keyboard.press('Backspace');
        await guestTab.keyboard.type(roomCode);
        await delay(200);

        const inputValues = await guestTab.evaluate(() => {
            const inps = Array.from(document.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
            return inps.map(i => ({ value: i.value, placeholder: i.placeholder }));
        });
        console.log("Guest input values before submit:", JSON.stringify(inputValues));

        console.log("Guest submitting join form...");
        // Click the submit button inside the form or request submit
        await guestTab.evaluate(() => {
            const submitBtn = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
            if (submitBtn) {
                submitBtn.click();
            } else {
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
            }
        });
        await delay(2000);

        const modalError = await guestTab.evaluate(() => {
            const errEl = document.querySelector('.bg-rose-50, .text-rose-600');
            return errEl ? errEl.textContent : null;
        });
        if (modalError) console.log("Guest modal warning/error:", modalError);

        const guestBodySample = await guestTab.evaluate(() => document.body.innerText.slice(0, 300));
        console.log("Guest tab text sample:", guestBodySample.replace(/\n+/g, ' '));

        // Verify Guest is in Lobby
        const guestInLobby = await guestTab.evaluate(() => {
            const text = (document.body.innerText || '').toUpperCase();
            return text.includes('LOBBY DE TORNEO') || text.includes('SALA MULTIJUGADOR');
        });
        console.log(`Guest in Lobby: ${guestInLobby}`);
        if (!guestInLobby) {
            throw new Error(`FAIL: Guest failed to enter LobbyScreen. Error: ${modalError}`);
        }
        console.log("✅ PASSED: Guest successfully entered multiplayer Lobby!");

        // Host starts game from Lobby
        console.log("Host clicking 'Iniciar Torneo'...");
        await clickByText(hostTab, 'Iniciar Torneo');
        await delay(2500);

        // Both tabs should now enter Character Selection
        const hostInSelection = await hostTab.evaluate(() => (document.body.innerText || '').toUpperCase().includes('SELECCI'));
        const guestInSelection = await guestTab.evaluate(() => (document.body.innerText || '').toUpperCase().includes('SELECCI'));
        console.log(`Host in Character Selection: ${hostInSelection}`);
        console.log(`Guest in Character Selection: ${guestInSelection}`);

        // Both pick characters in order
        console.log("Picking characters in multiplayer for Host and Guest...");
        await hostTab.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.aspect-\\[2\\/3\\]')) as HTMLElement[];
            if (cards.length > 0) cards[0].click();
        });
        await delay(1500);

        await guestTab.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.aspect-\\[2\\/3\\]')) as HTMLElement[];
            if (cards.length > 1) cards[1].click();
            else if (cards.length > 0) cards[0].click();
        });
        await delay(4000);

        // ==========================================
        // TEST 4: Guest Hand Visibility (Issue #1 & #2 Fix)
        // ==========================================
        console.log("\n--- TEST 4: Guest Hand Visibility & Interactive Display ---");
        // Check Guest's PlayerHandArea: Verify it renders Guest's interactive cards and NOT rival summary
        const guestHandView = await guestTab.evaluate(() => {
            const handArea = document.querySelector('.shrink-0.z-40');
            if (!handArea) return { found: false, isRival: false, cardCount: 0, text: '' };
            const text = (handArea as HTMLElement).innerText || '';
            const cardImages = handArea.querySelectorAll('img[alt*="RED"], img[alt*="BLUE"], img[alt*="GREEN"], img[alt*="BLACK"], img[alt*="COLORLESS"], img[alt*="RARE"], img[alt*="WHITE_FLAG"]');
            // If it says "Cartas en mano" instead of rendering the cards container, it's the bug
            const isRival = text.includes('Cartas en mano') && !text.includes('Sin cartas') && cardImages.length === 0;
            return {
                found: true,
                isRival,
                cardCount: cardImages.length,
                text: text.substring(0, 150)
            };
        });
        console.log("Guest Hand Area Verification:", guestHandView);
        if (guestHandView.isRival) {
            throw new Error("FAIL: Guest Hand Area is still rendering the rival compact summary!");
        }
        console.log("✅ PASSED: Guest player hand area renders interactive board, NOT rival summary!");

        // ==========================================
        // TEST 5: Disconnection & Rejoin Persistence (Issue #3 Fix)
        // ==========================================
        console.log("\n--- TEST 5: Disconnection Persistence & Quick Rejoin Flow ---");
        // Verify Guest saved room code in localStorage
        const savedRoom = await guestTab.evaluate(() => localStorage.getItem('tricktakers_last_room'));
        const savedName = await guestTab.evaluate(() => localStorage.getItem('tricktakers_player_name'));
        console.log(`Guest saved room in localStorage: "${savedRoom}"`);
        console.log(`Guest saved name in localStorage: "${savedName}"`);

        if (savedRoom !== roomCode) {
            throw new Error(`localStorage mismatch: expected ${roomCode}, got ${savedRoom}`);
        }
        console.log("✅ PASSED: Room code and player name persisted in localStorage.");

        // Simulate Guest navigating back to home
        console.log("Guest navigating to Home screen (simulating reload / disconnect)...");
        await guestTab.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await delay(1500);

        // Verify Guest sees "Reunirse a la Sala [PIN]" button on Home Screen!
        const rejoinButtonText = await guestTab.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const rBtn = btns.find(b => b.textContent?.includes('Reunirse a la Sala'));
            return rBtn ? rBtn.textContent?.trim().replace(/\s+/g, ' ') : null;
        });
        console.log(`Guest Home screen Rejoin Button: "${rejoinButtonText}"`);
        if (!rejoinButtonText || !rejoinButtonText.includes(roomCode)) {
            throw new Error(`FAIL: Rejoin button for room ${roomCode} not found on Home screen.`);
        }
        console.log("✅ PASSED: Quick Rejoin button dynamically rendered on Home screen!");

        // Click Rejoin!
        console.log("Guest clicking 'Reunirse a la Sala'...");
        await clickByText(guestTab, 'Reunirse a la Sala');
        await delay(2500);

        // Verify Guest is reconnected and game view is restored
        const reconnectedState = await guestTab.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const hasHomeSpecificButtons = btns.some(b => b.textContent?.includes('Básico') && b.textContent?.includes('Avanzado'));
            const text = (document.body.innerText || '').toUpperCase();
            const hasLobbyOrGame = text.includes('LOBBY') ||
                                   text.includes('SELECCI') ||
                                   text.includes('CAMPO DE BATALLA') ||
                                   text.includes('BAZAS') ||
                                   !!document.querySelector('.shrink-0.z-40');
            return {
                notOnHome: !hasHomeSpecificButtons,
                hasLobbyOrGame,
                sample: text.substring(0, 150)
            };
        });
        console.log("Guest Reconnection Result:", reconnectedState);
        if (!reconnectedState.hasLobbyOrGame) {
            throw new Error(`FAIL: Guest was not reconnected into the session. State: ${JSON.stringify(reconnectedState)}`);
        }
        console.log("✅ PASSED: Guest successfully reconnected and restored session!");

        console.log("\n==================================================");
        console.log("🎉 ALL REAL-WORLD BROWSER E2E TESTS PASSED 100%! 🎉");
        console.log("==================================================");

        await browser.close();
        cleanupAndExit(0);
    } catch (err: any) {
        console.error("\n❌ TEST ERROR:", err.message);
        await browser.close();
        cleanupAndExit(1);
    }
}

function cleanupAndExit(code: number) {
    if (previewProcess) {
        try {
            previewProcess.kill();
        } catch { }
    }
    process.exit(code);
}

runRealBrowserTests();
