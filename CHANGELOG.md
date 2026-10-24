# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-24T22:30+05:30 — Phase 2: abilities and preparation between waves

- Changed:
  - Abilities: `src/game/abilities/catalog.ts` defines Shield, Shock Pulse and a Scanner placeholder, with their numbers in `balance.ts`. `src/game/systems/abilities.ts` handles equipping, activating, cooldowns, shield duration and status.
  - Wave flow: `src/game/systems/waveFlow.ts` controls the order active → cleared → prep → next wave, and stops everything once the game is over. `src/game/systems/run.ts` creates a fresh run state on every start or restart.
  - Combat: `combat.ts` gains `applyContactDamage`, which the shield uses to block damage, and `targetsInRadius` for Shock Pulse.
  - Preparation screen: new `src/game/scenes/PrepScene.ts` shows three ability cards. Choose with ←/→, A/D, 1–3 or a click; Enter starts the next wave.
  - Arena: `ArenaScene.ts` uses the wave flow, pauses during preparation, adds the E/Shift ability key, the shield ring, the pulse ring, and messages for activation, cooldown, expiry and the offline Scanner. Both rings are created once and reused.
  - HUD and status: `HudScene.ts` shows the ability and its cooldown. `events.ts` and `GameShell.tsx` add the phase and ability status to the game state and the screen-reader status.
  - Input and docs: E and Shift are added in `inputState.ts`, the menu lists the new control, and the README is updated.
- Why: Phase 2 of the approved plan. It adds a playable ability system and a pause between waves before any camera or AI work. The Scanner deliberately does nothing so that nothing pretends to be AI output.
- Validation:
  - `npm run typecheck` passed. `npm run lint` passed. `npm test` passed: 8 files, 40 tests, adding ability, wave flow, run reset and combat tests. `npm run build` passed.
  - Browser check with Playwright driving Chrome against `npm start`:
    - Wave 1 cleared and opened preparation. Pressing 2 and then Enter twice started wave 2 only once, with Shock Pulse equipped.
    - E fired the pulse and started its cooldown. Pressing E again showed the cooldown message.
    - Wave 2 preparation: choosing Scanner showed "SCANNER OFFLINE - NO AI SCAN YET".
    - Wave 3 preparation: Shield was active for about 2.5 s, then went into cooldown.
    - After dying, Enter restarted at wave 1, score 0, HP 100, with a ready Shield and one canvas. No app console errors.
- Limitations:
  - No camera, gestures or AI. The Scanner is a placeholder.
  - Choosing an ability resets its cooldown.
  - The faded wave-clear banner can still show behind the preparation overlay.
  - Balance and frame rate have only been checked on a VM with software WebGL.
  - These commits have not been pushed.

## 2026-10-24T22:23+05:30 — Playtest fixes: edge clipping and early-wave difficulty

- Changed: `src/game/scenes/ArenaScene.ts`: the player's movement bounds are now inset by the 6 px margin around the sprite, so the whole sprite stays visible at the arena edges. `src/game/balance.ts`: Rustling speed raised from 110 to 125, the starting wave has 8 enemies instead of 6, and the base spawn interval is 750 ms instead of 900 ms.
- Why: The recorded UI playtest of PR #1 found the player sprite clipped at the left edge and waves 1–3 cleared at full HP with little movement.
- Validation: `npm run typecheck`, `npm run lint`, `npm test` (21 tests) and `npm run build` passed. In a Playwright check against `npm start`, holding A puts the player against the left edge with the sprite fully visible. Holding Space without moving now dies at wave 4 after 54 s, where it previously reached wave 5. Waves 1–3 were still cleared at 100 HP with this idle strategy. No app console errors.
- Limitations: Waves 1–3 are still forgiving, on purpose, as a warm-up. Balance needs a human playtest on real hardware. The HUD can overlap the player in the top-left corner.

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
