# her-portfolio

One-screen video portfolio: a phone floating over a plinth, clips orbit it and fly into the screen.

```bash
npm install
npm run dev      # open the printed URL; the Network URL works on your phone
npm run build    # static output in dist/
```

- Edit content in `src/content.json`.
- Drop clips into `public/videos/` and set `"src": "/videos/name.mp4"` on an item.
- Controls: scroll, swipe, arrow keys, or the numbers at the bottom.

See `CLAUDE.md` for the design rules, how the phone is anchored to the plinth, and the open work list.
