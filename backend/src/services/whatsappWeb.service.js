import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

let browser = null;
let page = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSION_DIR = path.join(__dirname, '../../.wa-session');

const ensureDir = (dir) => { try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {} };

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export const start = async () => {
  if (browser) return { ready: true };
  ensureDir(SESSION_DIR);
  browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: SESSION_DIR,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari');
  await page.goto('https://web.whatsapp.com/', { waitUntil: 'domcontentloaded' });
  return { ready: true };
};

const toE164 = (raw) => {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('3')) return `92${digits}`;
  return digits.startsWith('+' ) ? digits.slice(1) : digits;
};

export const sendText = async ({ to, text }) => {
  if (!browser) await start();
  if (!page) page = (await browser.pages())[0] || await browser.newPage();

  const phone = toE164(to);
  if (!phone) throw new Error('Invalid recipient phone');

  // Pre-fill message via wa.me deeplink
  const url = `https://web.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Wait for chat to load or QR login
  // If QR login is required, user must scan once; we wait some time and try to detect composer
  const composerSelector = 'div[contenteditable="true"][data-tab]';
  for (let i = 0; i < 40; i++) {
    const exists = await page.$(composerSelector);
    if (exists) break;
    await wait(500);
  }

  const composer = await page.$(composerSelector);
  if (!composer) {
    throw new Error('WhatsApp Web not ready. Please scan QR code in the opened window.');
  }

  // Press Enter to send if needed; message is prefilled
  await page.keyboard.press('Enter');
  await wait(800);
  return { success: true, to: `+${phone}` };
};

export const stop = async () => {
  try { if (browser) await browser.close(); } catch (_) {}
  browser = null; page = null;
  return true;
};

