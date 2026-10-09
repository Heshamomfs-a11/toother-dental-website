// Renders animation.html to an H.264 MP4 using headless Chromium + ffmpeg.
// Usage: node render.js [--fps 30] [--width 1920] [--out ../dental-implant-procedure.mp4] [--preview]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const FPS = Number(opt('fps', 30));
const WIDTH = Number(opt('width', 1920));
const OUT = path.resolve(opt('out', path.join(__dirname, '..', 'dental-implant-procedure.mp4')));
const POSTER = OUT.replace(/\.mp4$/, '-poster.jpg');
const PREVIEW = args.includes('--preview');   // dump a few PNG stills instead of a video
const SCALE = WIDTH / 1920;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE });
  await page.goto('file://' + path.join(__dirname, 'animation.html'));
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.VIDEO_DURATION);
  const total = Math.round(duration * FPS);
  console.log(`Rendering ${total} frames @ ${FPS}fps (${WIDTH}px wide) -> ${OUT}`);

  const grab = async (t) => {
    return page.evaluate((t) => {
      window.renderFrame(t);
      return document.getElementById('c').toDataURL('image/png').split(',')[1];
    }, t).then((b64) => Buffer.from(b64, 'base64'));
  };

  if (PREVIEW) {
    const dir = opt('previewDir', path.join(__dirname, 'preview'));
    fs.mkdirSync(dir, { recursive: true });
    const times = (opt('times', '2,8,17,25,35,43,50,58')).split(',').map(Number);
    for (const t of times) {
      fs.writeFileSync(path.join(dir, `t${String(t).padStart(2, '0')}.png`), await grab(t));
    }
    console.log('Preview stills written to', dir);
    await browser.close();
    return;
  }

  // poster: the completed restoration (step 6)
  const ff = spawn('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-vf', `scale=${WIDTH}:-2`, OUT,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));

  const write = (buf) => new Promise((res) => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res)));
  const start = Date.now();
  for (let i = 0; i < total; i++) {
    await write(await grab(i / FPS));
    if (i % 150 === 0) process.stdout.write(`  frame ${i}/${total} (${((Date.now() - start) / 1000).toFixed(0)}s)\n`);
  }
  ff.stdin.end();
  await done;

  const posterPng = await grab(52.5);
  const pf = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', '-', '-q:v', '3', '-vf', `scale=${WIDTH}:-2`, POSTER], { stdio: ['pipe', 'inherit', 'inherit'] });
  pf.stdin.end(posterPng);
  await new Promise((res) => pf.on('close', res));

  await browser.close();
  console.log('Done:', OUT, 'and', POSTER);
})().catch((e) => { console.error(e); process.exit(1); });
