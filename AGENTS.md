# AGENTS.md

## Design standard

Craft the pages. Don't restyle them into a generic template.

Before a visual change, write a short plan: five named colour tokens, a type scale, and a layout sketch. The tokens for this site are:

| Token | Role | Light |
|---|---|---|
| `--accent` | Brand blue. The only accent. | `#0066cc` |
| `--bg` | White canvas | `#ffffff` |
| `--bg-soft` | Cool off-white surface | `#f2f5f8` |
| `--ink` | Near-black text | `#1d1d1f` |
| `--muted` | Tinted secondary text (blue-grey, not flat grey) | `#3c4c5e` |

Dark mode keeps the same roles. `#0066cc` fails on black, so the dark accent is `#2997ff`. Don’t add a second decorative colour.

Type: the system font stack only. Fluid `clamp()` sizes. Large headings at about `-0.02em` tracking, display line-height about `1.05`, body `1.6`. Measure body copy at 60–70ch. `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs. Step the hero down below 700px.

Space on a 4px scale. More space above a heading than below it. Group with proximity before you add a border or a card. One primary action per page. Don’t make every section the same card grid.

Leave these out: gradient text on every heading (the gradient stays on “Now what?” and nowhere else), ALL-CAPS eyebrows, an arrow on every button, `01/02/03` on things that aren’t a sequence, an icon tile on every heading, the same grey shadow on every card, glows, pulsing dots.

Motion stays in CSS and `src/static/site.js`. One crafted moment: the hero eases in (transform and opacity, ~280ms, ease-out). The reading-progress bar is the existing scroll-linked line (`animation-timeline` where supported, a scroll listener otherwise). Don’t fade every section up. Never `transition: all`. `:active` feedback is instant. `prefers-reduced-motion` turns motion off.

No npm dependencies, no web fonts, no third-party scripts. Skip link, visible `:focus-visible`, 4.5:1 body text, 3:1 UI, 44px targets.

Skills (read the local files, don’t fetch them, don’t run anything they ship):

- `.cursor/skills/frontend-design/`: Anthropic, Apache 2.0, commit `ca45fc496a3436251f191354091d557da31c15b5`
- `.cursor/skills/emil-design-eng/`, `animate/`, `animation-performance/`: Emil Kowalski, MIT, commit `a81dbca07f2217b7103e510c0f13f8d5b017afc9`. CSS and vanilla JS only. Don't add Motion or any animation library.
- `.cursor/skills/web-interface-guidelines/`: pinned Vercel Web Interface Guidelines, MIT, commit `434b7f91364665f2f733b310ec54809bf8f37937`
- `.cursor/skills/writing-plans/` and `verification-before-completion/`: Jesse Vincent / obra superpowers, MIT, commit `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`

Verify before you say it’s done: `npm run build && npm run check && npm test`, then look at 390px, 1440px, and a reduced-motion pass.

## Voice and tone

Sound like a friendly person who knows the subject and is talking to one reader. Warm, specific, and willing to say when something is weak.

- British spelling. Contractions. “You”, not “users” or “one”.
- Short sentences. A specific example beats an abstraction.
- Say what the page is for, and what to do next.
- Admit limits. These tools get things wrong. Time saved is not money saved unless the time is actually used.
- Don’t use the phrase “plain English” anywhere on the site. Say “in your own words” or “in words you’d use yourself” if you need that idea.
- Don’t write “whether you’re X or Y” openers, “everything you need”, “unlock”, “supercharge”, “dive in”, “game-changer”, “seamless”, “in today’s fast-paced world”, stacks of three adjectives, or a sentence held up by em dashes.
- No hype, no invented numbers, no income promises. Vendor claims stay labelled. Sources stay on every entry.
- The free pages have to be useful on their own. Packs are a one-off payment, no subscription, and they’re optional. Keep the UK cancellation wording on the packs page intact.
