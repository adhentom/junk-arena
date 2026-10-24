# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-24T22:15+05:30 — Record human review of Milestone 1

- Changed: `AI_USAGE.md`: the Milestone 1 row now records that Adhen reviewed it on PR #1.
- Why: Keep the AI usage record accurate after review.
- Validation: Documentation-only change; checked that the diff touches only `AI_USAGE.md` and `CHANGELOG.md`.
- Limitations: None identified in these checks.

## 2026-10-24T21:55+05:30 — Milestone 1: keyboard-playable Phaser arena

- Changed: Set up a Next.js 16 + TypeScript app (`package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `vitest.config.mts`, `app/`, and additions to `.gitignore`). Added a Phaser 3.90 game in `src/game/`: Boot, Menu, Arena, HUD and Game Over scenes; game numbers kept in one place (`balance.ts`); pure scoring, wave and combat logic (`systems/`); a typed event bus between the game and React; and best-score storage. Added keyboard input in `src/input/` and a client-only React wrapper that loads the game, in `src/ui/GameShell.tsx`. Set `agentRules: false` in `next.config.ts` so Next.js doesn't rewrite our `AGENTS.md`. Updated the README project overview, run instructions, and controls.
- Why: Approved plan, Phase 1. Get a reliable game you can play end to end before adding the camera, gestures, or AI.
- Validation: `npm run typecheck` passed. `npm run lint` passed. `npm test` passed: 5 files, 21 tests. `npm run build` passed. Ran a browser smoke test against `npm start` with Playwright driving Chrome: one canvas, the menu shows, Enter starts wave 1, and score, wave and HP update. Holding Space without moving reached wave 5 and died there, after waves were made harder (below). Game Over showed "SCRAPPED", score, wave and "NEW BEST!". Enter restarted at wave 1, score 0, HP 100, still with one canvas. No app console errors. An earlier playtest of the same strategy lasted 90 s and reached wave 6 at full HP, so I added per-wave enemy speed growth (+8%) and batch spawning (one more enemy every 2 waves, up to 4).
- Limitations: Keyboard only. No camera, gestures, AI scanning, sound, or deployment yet. Chrome on the test VM used software WebGL, so frame rate and balance still need checking on a real laptop.

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included. GitHub publication and template status are verified separately after creation.
