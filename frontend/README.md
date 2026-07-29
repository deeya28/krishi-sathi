# Krishi Sathi — Landing Page (Frontend)

A complete, runnable Vite + React + Tailwind + Framer Motion frontend for the
Krishi Sathi landing page. Backend is not included — the contact form has a
clearly marked spot for your friend to plug in the API.

## Project structure
```
krishi-sathi/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .gitignore
└── src/
    ├── main.jsx          ← React entry point
    ├── App.jsx            ← renders <LandingPage />
    ├── index.css          ← Tailwind directives
    ├── fonts.css          ← Google Fonts import
    ├── assets/
    │   ├── hero-paddy.jpg
    │   └── about-field-scan.jpg
    └── components/
        ├── LandingPage.jsx   ← assembles all sections below
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── About.jsx
        ├── MissionVision.jsx
        ├── Features.jsx
        ├── Team.jsx
        ├── Contact.jsx
        └── Footer.jsx
```

## Run it

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```
Then open the local URL Vite prints (usually `http://localhost:5173`).

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Merging into your existing Krishi Sathi repo
If you already have a React/Vite project (with MongoDB Atlas backend, i18next,
Recharts, etc.), you don't need this whole scaffold — just copy these into
your existing `src/`:
- `src/components/` (all files)
- `src/assets/` (the two images)
- `src/fonts.css`

Then add `import "./fonts.css";` near the top of your existing `main.jsx`,
and render `<LandingPage />` wherever your router points to the home route.
Make sure `framer-motion` is installed (`npm install framer-motion`) and that
Tailwind is already configured — this code uses Tailwind utility classes with
arbitrary hex values, so no config changes are strictly required, though the
`tailwind.config.js` here shows the named color/font tokens if you'd rather
use `bg-paddy-green` style classes instead.

## Wiring the contact form to the backend
`src/components/Contact.jsx` currently fakes a submit with `setTimeout`.
Replace the `TODO` block inside `handleSubmit`:
```js
await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});
```

## Pages included
- `/` — public landing page
- `/login`, `/register` — auth pages
- `/dashboard` — logged-in home feed (create post, recent posts, weather/tips/announcements panel)
- `/marketplace` — product listings (seeds, fertilizer, equipment) with category filters
- `/expert` — browse experts and book a consultation, with payment method selection (eSewa, Khalti, IME Bank)

The dashboard, marketplace, and expert pages share a common app shell
(`src/components/dashboard/DashboardLayout.jsx`) with a top bar (search,
notifications, profile menu) and a left sidebar (matching the wireframe you
shared). All sample data (posts, listings, experts) is hardcoded placeholder
content for your friend to swap out once the backend is ready.

## Changing colors
All colors live in **`src/App.css`**. Open that file and edit the numbers —
every button, background, and text color on the site updates automatically.

```css
:root {
  --color-paper: 245 241 230;       /* main background */
  --color-paddy-green: 47 82 51;    /* primary brand green */
  --color-gold-grain: 200 155 60;   /* accent gold */
  --color-soil-dark: 28 35 24;      /* dark backgrounds (footer, team) */
  --color-soil: 58 46 34;           /* subtle borders */
  --color-text: 0 0 0;              /* main text color */
}
```
Values are written as `R G B` (space-separated, no `#`, no commas) so opacity
still works, e.g. `bg-paddy-green/50`. To find the R G B numbers for a new hex
color, any color picker (or a quick Google search "hex to rgb") will give you
the three numbers to drop in.

## Design notes
- **Palette:** deep paddy green `#2F5233`, harvest gold `#C89B3C`, warm paper
  cream `#F5F1E6`, near-black soil text `#1C2318` / `#3A2E22`.
- **Fonts:** Fraunces (headings), Work Sans (body), JetBrains Mono (small
  labels/eyebrows).
- **Hero** uses the rice-planting photo full-bleed instead of a generic
  gradient hero.
- **About** section's signature element is the pulsing scan-frame + status
  label (`Scanning leaf... → Healthy ✓`) over the phone-in-field photo — a nod
  to the platform's diagnostic/smart-agriculture angle.
- Sections animate in on scroll via `framer-motion`'s `whileInView` (each
  fires once, not on every scroll pass).

Swap in real content (team photos, exact phone number, etc.) wherever you see
placeholder values.
