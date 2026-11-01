# Portfolio site: content creator (short & long-form social video)

A one-screen portfolio for a social media content creator (ex-Wix; Reels, TikTok, YouTube). The whole site is one idea:
**a phone floats over a concrete plinth in a dreamy seaside wildflower scene, and her videos orbit it and fly into its screen.**
Long-form (landscape) videos rotate the phone to landscape.

Audience: hiring managers and creative leads at brands and agencies. They should get "she makes great short-form video" in 3 seconds,
and "she owns the whole process and gets results" within 30.

## Stack
- Vite + vanilla JS + plain CSS. No framework; keep it that way unless a real need appears.
- `npm install` · `npm run dev` (also on your LAN for phone testing) · `npm run build` → `dist/`
- Deploy: GitHub Pages at ofirelboym.com. Pushing to `main` builds and deploys via `.github/workflows/deploy.yml`.

## Files
- `index.html`: markup for the stage, masthead and bottom bar
- `src/main.js`: state (current clip, sound), wiring, caption/nav rendering
- `src/carousel.js`: builds clip cards; `layout()` places the phone, plinth shadow and every card; `play()` handles video playback
- `src/scene.js`: **plinth anchoring** (see below) and phone sizing
- `src/input.js`: wheel (one clip per gesture), swipe, arrow keys, mouse tilt
- `src/dust.js`: canvas dust motes
- `src/content.json`: **all content lives here**
- `public/bg.jpg`: background (2400×1792). `public/videos/`: put clips here to start

## Content model (`src/content.json`)
Each item: `brand, title, platform, format ("short" | "long"), role, views, src, poster, hook[], caption, palette[3]`.
- `src: null` renders a placeholder clip (gradient + hook text). Set `src` to a video URL to use the real file.
- Orientation is detected from the video file and overrides `format`.
- Placeholder titles and stats are made up. Replace them all with her real work before launch.

## Plinth anchoring
The phone must always stand on the plinth in `bg.jpg`, at every viewport size.
`scene.js` holds the plinth's top-surface centre and half-width **in source-image pixels** (`BG`), replays the `object-fit: cover`
math to find it on screen, and sizes and places the phone from that. `BG.posX/posY` must match `.bg { object-position }` in CSS.
**If the background image changes:** open it in any image viewer, read off the plinth's top-surface centre (x, y) and half-width
in pixels, update `BG`. For a mobile background (9:16), use `<picture>`/`srcset` plus a second `BG` config picked by aspect ratio.

## Design direction: rules
The scene carries the mood; the UI nearly disappears. Reference for restraint: nite-riot.com (minimal, a bit of edge).
- **One typeface** (currently Familjen Grotesk), 3 sizes max for UI. Lowercase nav. No second "display" face, no mono "data" face.
- **No glass cards, pills, badges, or stat tiles.** Text sits directly on the scene; legibility comes from the bottom shade gradient.
- Caption = brand / title / one meta line. Navigation = small numbers. No arrow buttons (keys, wheel, swipe, numbers cover it).
- No emoji, no gradients on UI elements, no rounded-everything, no drop shadows on text blocks.
- Motion: one orchestrated moment (clip flies into the phone). Everything else is slow and ambient (bob, breathe, dust).
- Feminine and Instagram-adjacent through the **scene and her content**, not through pink UI chrome.
- Always respect `prefers-reduced-motion`.

## Open work (rough priority)
1. **Real content**: her clips, titles, roles, real numbers. Get poster frames (first frame as JPG) for every clip.
2. **Video hosting**: start with MP4s in `public/videos` (H.264, ≤1080p, ~2–4 Mbps, faststart). Move to Cloudflare Stream or Mux
   (HLS, adaptive) once there are more than ~10 clips or files get heavy. Only the active clip plays; neighbours preload.
3. **Type pass**: try 2–3 alternatives to Familjen Grotesk side by side (e.g. Hanken Grotesk, Instrument Sans, General Sans via Fontshare).
   Pick by how the name and the caption title look over the scene.
4. **Mobile**: generate a 9:16 version of the background (same prompt, plinth in lower third), wire it with `<picture>` + a second `BG`.
   On narrow screens consider dropping side cards to ±1 and letting swipe do the work.
5. **About + contact**: an overlay or second screen (short bio, brands worked with, email as plain selectable text, IG/TikTok/LinkedIn,
   CV download). Keep the same restraint.
6. **Case study view** (optional): click the active clip to open brief → idea → result for that piece.
7. **Polish**: OG image (screenshot of the scene with a clip), favicon, `<title>` with her name, analytics (Plausible/Vercel),
   Lighthouse pass, keyboard focus order, captions for videos with speech.

## Don'ts
- Don't replace the CSS 3D phone with a Three.js model unless the CSS version clearly falls short; it's light and easy to tune.
- Don't autoplay with sound. Sound is opt-in via the masthead toggle.
- Don't add a scrollable page below the stage until about/contact are designed; the one-screen feel is the point.
