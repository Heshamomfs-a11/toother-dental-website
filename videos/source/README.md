# Dental implant procedure video

`videos/dental-implant-procedure.mp4` is an animated explainer rendered from
`animation.html`, a deterministic HTML canvas animation (62 s, 1920×1080, 30 fps).

- **Preview**: open `animation.html` in a browser; it plays in a loop.
- **Edit**: timings live in `SCENES` / `STEPS` at the top of the script; each
  scene is a `sceneStepN(lt, alpha, t)` function.
- **Render** (needs Node, Playwright with Chromium, and ffmpeg):

  ```bash
  cd videos/source
  node render.js                 # writes ../dental-implant-procedure.mp4 + poster
  node render.js --width 1280    # smaller 720p output
  node render.js --preview       # dumps PNG stills to ./preview for a quick check
  ```

The video is silent by design (it autoplays muted-friendly on the site and uses
on-screen captions for every step).
