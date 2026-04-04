# TLDR News

> The news. Without the noise.

**[Live demo →](https://tldr-news-eight.vercel.app)**

---

TLDR News is a mobile-first news reader that strips every story down to what actually matters — a two-sentence summary, three bullet points, and a link if you want more. Swipe through like TikTok, but for staying informed instead of doomscrolling.

No ads. No algorithm trying to keep you angry. Just news, fast.

---

## What it looks like

Four categories: **World**, **Tech & AI**, **Business**, **Politics**.

Each card gives you:
- A headline
- A 1-2 sentence TLDR (written by AI, based on the actual article)
- 2-3 bullet points with the specific facts worth knowing
- The article image when there is one
- A "Read full story" link if you want to go deeper

Swipe down for the next story. That's the whole app.

---

## How it works (the blueprint)

Three pieces talk to each other:

**1. The Guardian API** pulls the 10 most recent articles per category. It's free, works in production, and doesn't require a credit card. You get the headline, a short description, a thumbnail image, and the article URL.

**2. Claude Haiku** takes all 10 articles at once and writes a TLDR + bullet points for each one in a single API call. Fast and cheap — it uses the smallest Claude model because the task is straightforward.

**3. Next.js caches the result for 30 minutes** so you're not burning API credits every time someone loads the page. After 30 minutes, it fetches fresh news automatically.

That's it. Fetch → summarize → cache → display.

---

## Run it yourself

You need two API keys:

| Key | Where to get it | Cost |
|-----|----------------|------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Pay-as-you-go (tiny) |
| `GUARDIAN_API_KEY` | [open-platform.theguardian.com](https://open-platform.theguardian.com/access/) | Free |

Then:

```bash
git clone https://github.com/Silicon-Valli/tldr-news.git
cd tldr-news
npm install
```

Create a `.env.local` file in the root:

```
ANTHROPIC_API_KEY=your_key_here
GUARDIAN_API_KEY=your_key_here
```

Start it:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000) in your browser. The swipe experience is designed for mobile, so use Chrome DevTools → toggle device toolbar to preview it at phone width. (Or access it from your phone via your computer's local IP, like `192.168.x.x:3000`, if you're on the same WiFi.)

---

## Deploy it

Push to GitHub, connect to [Vercel](https://vercel.com), add your two environment variables in the Vercel project settings, and deploy. Takes about five minutes.

The Guardian API `test` key works for local development but swap in your real key for production.

---

## Tech stack

- **[Next.js](https://nextjs.org)** — App Router, server-side API routes, `unstable_cache` for caching
- **[The Guardian Open Platform](https://open-platform.theguardian.com)** — News data (free tier, production-ready)
- **[Anthropic Claude Haiku](https://www.anthropic.com)** — AI summaries and bullet points
- **[Vercel](https://vercel.com)** — Hosting and deployment
- **CSS scroll-snap** — The swipe mechanic, no JavaScript library needed
- **Tailwind CSS** — Styling

---

## The philosophy

Most news apps are designed to maximize time-on-app. This one is designed to minimize it. Read five stories in two minutes, know what's happening, close it and get on with your day.

Built in one day as part of a personal challenge: one polished MVP per day.

---

## License

MIT. Fork it, break it, make it yours.
