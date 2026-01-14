import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';
import pngToIco from 'png-to-ico';

async function main() {
  const FRONTEND_DIR = process.cwd();
  const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');
  const outIco = path.join(PUBLIC_DIR, 'favicon.ico');

  const candidates = [
    'school_icon.png',
    'school.png',
    'logofavicon.png',
    'favicon.png',
    'logo.png'
  ];

  let sourcePath = null;
  for (const c of candidates) {
    const p = path.join(PUBLIC_DIR, c);
    if (fs.existsSync(p)) { sourcePath = p; break; }
  }

  if (!sourcePath) {
    console.log('[make-ico] No PNG icon found in public/. Skipping ICO generation.');
    process.exit(0);
  }

  console.log(`[make-ico] Using source: ${path.basename(sourcePath)}`);

  // Generate multiple sizes
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];
  const image = await Jimp.read(sourcePath);
  const square = Math.min(image.bitmap.width, image.bitmap.height);
  const cropped = image.clone().cover(square, square);

  for (const size of sizes) {
    const resized = cropped.clone().resize(size, size);
    const buf = await resized.getBufferAsync(Jimp.MIME_PNG);
    pngBuffers.push(buf);
  }

  const ico = await pngToIco(pngBuffers);
  fs.writeFileSync(outIco, ico);
  console.log(`[make-ico] Wrote ${path.relative(FRONTEND_DIR, outIco)}`);
}

main().catch((err) => {
  console.error('[make-ico] Failed:', err);
  process.exit(1);
});
