/*
  Renders root-canal-animation.html to MP4 (H.264) and WebM (VP9), plus a poster frame.

  Usage:  node videos/source/render.js [--preview]
    --preview   writes a handful of PNG frames to videos/source/preview/ instead of a video.

  Requires: node, playwright (Chromium) and ffmpeg on PATH.
*/
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(__dirname, 'root-canal-animation.html');
const OUT_MP4 = path.join(ROOT, 'videos', 'root-canal-treatment.mp4');
const OUT_WEBM = path.join(ROOT, 'videos', 'root-canal-treatment.webm');
const OUT_POSTER = path.join(ROOT, 'images', 'root-canal-poster.jpg');
const FPS = 30;
const POSTER_TIME = 24.6; // seconds – access cavity with the handpiece

const preview = process.argv.includes('--preview');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => { window.__RENDER_MODE__ = true; });
  await page.goto('file://' + SRC);
  await page.evaluate(() => document.fonts.ready);
  // Load the logo as a data URL so the canvas is not tainted by a file:// image.
  const logoB64 = fs.readFileSync(path.join(ROOT, 'images', 'logo.png')).toString('base64');
  await page.evaluate((src) => new Promise((res) => {
    const img = window.logo;
    img.onload = res; img.onerror = res;
    img.src = src;
  }), 'data:image/png;base64,' + logoB64);
  const duration = await page.evaluate(() => window.DURATION);

  async function frameAt(t, type, quality) {
    return page.evaluate(([t, type, quality]) => {
      window.render(t);
      const url = document.getElementById('c').toDataURL(type, quality);
      return url.substring(url.indexOf(',') + 1);
    }, [t, type, quality]);
  }

  if (preview) {
    const dir = path.join(__dirname, 'preview');
    fs.mkdirSync(dir, { recursive: true });
    const times = [1.5, 6.0, 9.5, 12.5, 18.0, 23.0, 29.0, 32.5, 37.0, 41.0, 44.0];
    for (const t of times) {
      const b64 = await frameAt(t, 'image/png');
      fs.writeFileSync(path.join(dir, `t${t.toFixed(1).replace('.', '_')}.png`), Buffer.from(b64, 'base64'));
    }
    console.log('preview frames written to', dir);
    await browser.close();
    return;
  }

  // Poster frame
  const posterB64 = await frameAt(POSTER_TIME, 'image/jpeg', 0.9);
  fs.writeFileSync(OUT_POSTER, Buffer.from(posterB64, 'base64'));

  // Stream PNG frames into ffmpeg (H.264, yuv420p for broad browser support)
  const total = Math.round(duration * FPS);
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-an', OUT_MP4
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const write = (buf) => new Promise((res) => { if (!ff.stdin.write(buf)) ff.stdin.once('drain', res); else res(); });

  for (let i = 0; i < total; i++) {
    const b64 = await frameAt(i / FPS, 'image/png');
    await write(Buffer.from(b64, 'base64'));
    if (i % 150 === 0) console.log(`frame ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', (code) => (code === 0 ? res() : rej(new Error('ffmpeg exited ' + code)))));
  await browser.close();
  console.log('wrote', OUT_MP4);

  // WebM transcode from the MP4
  await new Promise((res, rej) => {
    const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', OUT_MP4,
      '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '33', '-row-mt', '1', '-an', OUT_WEBM], { stdio: 'inherit' });
    p.on('close', (code) => (code === 0 ? res() : rej(new Error('ffmpeg exited ' + code))));
  });
  console.log('wrote', OUT_WEBM, 'and', OUT_POSTER);
})().catch((e) => { console.error(e); process.exit(1); });
