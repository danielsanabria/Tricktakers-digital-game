/**
 * Comprehensive Local E2E Test
 * Tests: Local AI game flow, character selection, round progression, Volver a Jugar
 * This doesn't require real WebRTC internet - focuses on what matters for gameplay.
 */

import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import http from 'http';
import fs from 'fs';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const PORT = Math.floor(4500 + Math.random() * 2000);
const BASE_URL = `http://localhost:${PORT}`;
let passed = 0;
let failed = 0;

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

function assert(condition: boolean, message: string) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

let previewProcess: ChildProcess | null = null;
let browser: Browser | null = null;

async function withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser!.newPage();
    page.on('pageerror', err => console.warn('>>> [PAGE ERR]:', err.message));
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    try {
        return await fn(page);
    } finally {
        await page.close();
    }
}

async function runTests() {
    console.log("=========================================");
    console.log("  TRICKTAKERS COMPREHENSIVE E2E TEST     ");
    console.log("=========================================\n");

    // Start server
    previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
        shell: true,
        stdio: 'pipe'
    });

    const ready = await waitForServer(BASE_URL);
    if (!ready) throw new Error("Server failed to start");
    console.log(`✅ Preview server at ${BASE_URL}\n`);

    browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    // ======================================================
    // TEST BLOCK 1: HOME MENU & NAVIGATION
    // ======================================================
    console.log("=== TEST BLOCK 1: HOME MENU ===");
    await withPage(async (page) => {
        await page.waitForSelector('button', { timeout: 8000 });

        // Check logo renders
        const hasLogo = await page.evaluate(() => !!document.querySelector('img[alt="Tricktakers Logo"]'));
        assert(hasLogo, 'Logo renders on home screen');

        // Check game mode buttons exist
        const modes = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return {
                hasBasico: btns.some(b => b.textContent?.includes('Básico') || b.textContent?.includes('BASICO')),
                hasAllStar: btns.some(b => b.textContent?.includes('All Star') || b.textContent?.includes('ALL STAR')),
                hasExpansion: btns.some(b => b.textContent?.includes('Expansión') || b.textContent?.includes('EXPANSION')),
                hasMulti: btns.some(b => b.textContent?.includes('Multijugador'))
            };
        });
        assert(modes.hasMulti, 'Multiplayer button exists');

        // Background pattern present
        const hasBgPattern = await page.evaluate(() => !!document.querySelector('.bg-pattern'));
        assert(hasBgPattern, 'Background pattern renders');
    });

    // ======================================================
    // TEST BLOCK 2: BASIC MODE - AI GAME FLOW
    // ======================================================
    console.log("\n=== TEST BLOCK 2: BASIC MODE AI GAME ===");
    await withPage(async (page) => {
        await page.waitForSelector('button', { timeout: 8000 });

        // Start a Básico game
        await page.evaluate(() => {
            const img = document.querySelector('img[alt="Modo Básico"]');
            const btn = (img?.closest('button') || img) as HTMLElement;
            if (btn) btn.click();
        });
        await delay(2000);

        // Should be in character selection now
        const inCharSelection = await page.evaluate(() => {
            const text = document.body.textContent || '';
            return text.includes('Selección de Personaje') || text.includes('Turno actual') || text.includes('RONDA') || text.includes('Baza');
        });
        assert(inCharSelection, 'Game started - character selection or gameplay visible');

        if (inCharSelection) {
            // Select a character if in character selection
            await page.evaluate(() => {
                const charCard = document.querySelector('.cursor-pointer');
                if (charCard) (charCard as HTMLElement).click();
            });
            await delay(1500);

            // Let AI play for a bit (wait for trick playing phase)
            let inTrick = false;
            for (let i = 0; i < 12; i++) {
                await delay(1000);
                inTrick = await page.evaluate(() => {
                    const text = document.body.textContent || '';
                    return text.includes('RONDA') || text.includes('Baza') || text.includes('corona') || text.includes('pts');
                });
                if (inTrick) break;
            }
            assert(inTrick, 'Game progressed to trick-playing phase');
        }
    });

    // ======================================================
    // TEST BLOCK 3: MULTIPLAYER LOBBY - CREATE ROOM
    // ======================================================
    console.log("\n=== TEST BLOCK 3: MULTIPLAYER LOBBY FLOW ===");
    await withPage(async (page) => {
        await page.waitForSelector('button', { timeout: 8000 });

        // Click Multijugador Online
        await page.evaluate(() => {
            const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Multijugador Online'));
            if (h3) {
                const btn = h3.closest('button');
                if (btn) btn.click();
            }
        });
        await delay(800);

        const modalOpened = await page.evaluate(() => !!document.querySelector('[class*="fixed"][class*="inset-0"]'));
        assert(modalOpened, 'Multiplayer modal opens');

        // Select "Crear Nueva Sala"
        await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Crear Nueva Sala'));
            if (btn) btn.click();
        });
        await delay(500);

        const createFormVisible = await page.evaluate(() => !!document.querySelector('form'));
        assert(createFormVisible, 'Create room form appears');

        // Enter name
        await page.evaluate(() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) {
                input.value = 'TestHost';
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        // Submit
        await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
        });
        await delay(2000);

        // Check lobby loads
        const lobbyLoaded = await page.evaluate(() => {
            const text = document.body.textContent || '';
            return text.includes('Lobby') || text.includes('Código de Invitación') || text.includes('Sala');
        });
        assert(lobbyLoaded, 'Lobby screen loads after creating room');

        // Check room code appears
        const roomCode = await page.evaluate(() => {
            const codeEl = document.querySelector('.text-4xl.font-mono');
            return codeEl?.textContent?.trim() || '';
        });
        assert(roomCode.length === 4, `Room code generated correctly (got: "${roomCode}")`);

        // Check localhost saves room in localStorage
        const savedRoom = await page.evaluate(() => localStorage.getItem('tricktakers_last_room'));
        assert(savedRoom === roomCode, 'Room code saved to localStorage for rejoin');

        // Check leave lobby button works
        await page.evaluate(() => {
            const leaveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Salir de la Sala'));
            if (leaveBtn) leaveBtn.click();
        });
        await delay(1000);

        const backHome = await page.evaluate(() => {
            const text = document.body.textContent || '';
            return text.includes('Multijugador Online') || text.includes('Básico');
        });
        assert(backHome, 'Leaving lobby returns to home screen');
    });

    // ======================================================
    // TEST BLOCK 4: JOIN ROOM FLOW - CODE ENTRY
    // ======================================================
    console.log("\n=== TEST BLOCK 4: JOIN ROOM WITH CODE ===");
    await withPage(async (page) => {
        await page.waitForSelector('button', { timeout: 8000 });

        // Click Multijugador Online
        await page.evaluate(() => {
            const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Multijugador Online'));
            if (h3) {
                const btn = h3.closest('button');
                if (btn) btn.click();
            }
        });
        await delay(800);

        // Select "Unirse con Código"
        await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Unirse con Código'));
            if (btn) btn.click();
        });
        await delay(500);

        const joinFormVisible = await page.evaluate(() => !!document.querySelector('input[maxlength="4"]'));
        assert(joinFormVisible, 'Join form with code input appears');

        // Enter invalid code to test validation
        await page.evaluate(() => {
            const codeInput = document.querySelector('input[maxlength="4"]') as HTMLInputElement;
            if (codeInput) {
                codeInput.value = 'AB';
                codeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
        });
        await delay(500);

        const hasError = await page.evaluate(() => {
            const text = document.body.textContent || '';
            return text.includes('4 caracteres') || text.includes('error') || text.includes('Error');
        });
        assert(hasError, 'Validation error shows for short code');
    });

    // ======================================================
    // TEST BLOCK 5: VOLVER A JUGAR RESET
    // ======================================================
    console.log("\n=== TEST BLOCK 5: VOLVER A JUGAR / RESET ===");
    await withPage(async (page) => {
        await page.waitForSelector('button', { timeout: 8000 });

        // Start Basic game
        await page.evaluate(() => {
            const imgBtns = Array.from(document.querySelectorAll('button')).filter(b => b.querySelector('img'));
            if (imgBtns.length > 0) imgBtns[0].click();
        });
        await delay(1500);

        // Check header reset button works
        await page.evaluate(() => {
            // Find GameHeader reset button
            const allBtns = Array.from(document.querySelectorAll('button'));
            const resetBtn = allBtns.find(b => {
                const icon = b.querySelector('i');
                return icon && (icon.className.includes('house') || icon.className.includes('rotate'));
            });
            if (resetBtn) resetBtn.click();
        });
        await delay(1000);

        const backHome = await page.evaluate(() => {
            const text = document.body.textContent || '';
            return text.includes('Multijugador Online') || text.includes('Básico') || text.includes('Tricktakers');
        });
        assert(backHome, 'Header reset button returns to home screen');
    });

    // ======================================================
    // TEST BLOCK 6: MULTIPLAYER LOCAL - TWO TABS SAME BROWSER  
    // ======================================================
    console.log("\n=== TEST BLOCK 6: MULTIPLAYER - SAME BROWSER TWO TABS ===");
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();

    try {
        page1.on('pageerror', err => console.warn('>>> [PAGE1 ERR]:', err.message));
        page2.on('pageerror', err => console.warn('>>> [PAGE2 ERR]:', err.message));

        await page1.setViewport({ width: 1280, height: 800 });
        await page2.setViewport({ width: 1280, height: 800 });

        // HOST creates room
        await page1.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await page1.evaluate(() => localStorage.clear());
        await page1.reload({ waitUntil: 'networkidle2' });
        await page1.waitForSelector('button', { timeout: 8000 });

        // Open modal
        await page1.evaluate(() => {
            const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Multijugador Online'));
            if (h3) { const btn = h3.closest('button') as HTMLElement; if (btn) btn.click(); }
        });
        await delay(600);

        // Crear sala
        await page1.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Crear Nueva Sala'));
            if (btn) btn.click();
        });
        await delay(400);

        await page1.evaluate(() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) { input.value = 'HostPlayer'; input.dispatchEvent(new Event('input', { bubbles: true })); }
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
        });
        await delay(2000);

        const hostRoomCode = await page1.evaluate(() => {
            const codeEl = document.querySelector('.text-4xl.font-mono');
            return codeEl?.textContent?.trim() || '';
        });
        assert(hostRoomCode.length === 4, `Host lobby shows 4-char room code: ${hostRoomCode}`);

        // GUEST joins from page2
        await page2.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await page2.waitForSelector('button', { timeout: 8000 });

        await page2.evaluate(() => {
            const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Multijugador Online'));
            if (h3) { const btn = h3.closest('button') as HTMLElement; if (btn) btn.click(); }
        });
        await delay(600);

        await page2.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Unirse con Código'));
            if (btn) btn.click();
        });
        await delay(500);

        // Type room code using Puppeteer keyboard input
        await page2.type('input[placeholder="ABCD"]', hostRoomCode);
        await delay(300);

        // Submit form
        await page2.evaluate(() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
        });
        await delay(2500);

        // Guest should be in lobby (BroadcastChannel works in same browser)
        const guestInLobby = await page2.evaluate(() => {
            const text = document.body.textContent || '';
            return text.includes('Lobby') || text.includes('Código de Invitación') || text.includes('esperando');
        });
        assert(guestInLobby, 'Guest lands in lobby after joining with code');

        // Check if host sees guest (BroadcastChannel sync)
        let hostSeesGuest = false;
        for (let i = 0; i < 10; i++) {
            await delay(1000);
            hostSeesGuest = await page1.evaluate(() => {
                const text = document.body.textContent || '';
                return text.includes('Jugador Conectado') || text.includes('GuestPlayer') || document.querySelectorAll('.bg-emerald-500').length >= 2;
            });
            if (hostSeesGuest) break;
        }
        assert(hostSeesGuest, 'Host sees guest player in lobby via BroadcastChannel');

        // Host starts game with bots to fill
        if (hostSeesGuest) {
            await page1.evaluate(() => {
                const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Iniciar Torneo') || b.textContent?.includes('Comenzar'));
                if (startBtn) startBtn.click();
            });
            await delay(3000);

            // Check both are past lobby
            const hostInGame = await page1.evaluate(() => {
                const text = document.body.textContent || '';
                return !text.includes('Lobby de Torneo') && (text.includes('RONDA') || text.includes('Personaje') || text.includes('Selección') || text.includes('corona'));
            });
            const guestInGame = await page2.evaluate(() => {
                const text = document.body.textContent || '';
                return !text.includes('Lobby de Torneo') && (text.includes('RONDA') || text.includes('Personaje') || text.includes('Selección') || text.includes('corona'));
            });

            assert(hostInGame, 'Host advances past lobby into game');
            assert(guestInGame, 'Guest receives game state and advances past lobby');
        }
    } finally {
        await page1.close();
        await page2.close();
    }

    // ======================================================
    // SUMMARY
    // ======================================================
    console.log("\n=========================================");
    console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
        console.log("  ✅ ALL TESTS PASSED!");
    } else {
        console.log("  ❌ Some tests failed. See above for details.");
    }
    console.log("=========================================\n");

    return failed;
}

function cleanup() {
    if (previewProcess && previewProcess.pid) {
        try {
            spawn('taskkill', ['/pid', String(previewProcess.pid), '/T', '/F']);
        } catch (e) {}
    }
    if (browser) {
        browser.close().catch(() => {});
    }
}

runTests()
    .then(failures => {
        cleanup();
        process.exit(failures > 0 ? 1 : 0);
    })
    .catch(err => {
        console.error("❌ Fatal error:", err);
        cleanup();
        process.exit(1);
    });
