---
name: web-interface-guidelines
description: Review UI against a pinned copy of Vercel’s Web Interface Guidelines. Use when building or checking pages, CSS, or client JS for accessibility, focus, forms, motion, typography, and performance. Do not fetch the live guidelines.
license: MIT. See LICENSE. The rules in command.md are a verbatim pin of vercel-labs/web-interface-guidelines.
---

# Web Interface Guidelines (pinned)

This folder is a local pin of [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) `command.md` at commit `434b7f91364665f2f733b310ec54809bf8f37937`. MIT, copyright Vercel Labs.

Do not fetch the guidelines from GitHub or any other URL at review time. Read `command.md` in this folder.

This site is static HTML, CSS and vanilla JS, with no npm dependencies. Ignore rules that only apply to React or Next.js (`onKeyDown` as the only keyboard path, `nuqs`, `focus-visible:ring-*` as a class name, `spellCheck={false}`). Use the same idea in plain HTML and CSS: real buttons and links, `:focus-visible`, labelled inputs, `prefers-reduced-motion`, explicit transition properties, curly quotes and `…`, image width and height, lazy loading below the fold.
