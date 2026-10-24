# AI usage record

Use Codex during the hackathon and briefly document its actual contribution here. Add a row after each meaningful task or milestone. Keep summaries concise and omit secrets, private data, and full chat transcripts.

## Event build log

Mark human review as pending until someone has reviewed the contribution.

| Date and time with timezone | Tool / model, if known | Task | Assistance and affected files | Human review / corrections | Validation and result |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24T21:55+05:30 | Devin (Cognition AI) | Milestone 1: keyboard-playable Phaser arena | Set up the Next.js app and wrote the Phaser scenes, the scoring, wave and combat logic, keyboard input, the React wrapper, the unit tests, and the README and CHANGELOG updates. Files: `app/`, `src/`, config files, `README.md`, `CHANGELOG.md`. | Reviewed by Adhen (@adhentom) on PR #1 at 2026-10-24T22:15+05:30. No corrections requested. | Lint, typecheck, `npm test` (21 tests) and `npm run build` passed. A Playwright browser smoke test covered start, gameplay, Game Over and restart. Balance was adjusted after an automated playtest showed the game was too easy. |
| 2026-10-24T22:30+05:30 | Devin (Cognition AI) | Phase 2: abilities and preparation between waves | Designed and wrote the ability catalog and system, the wave flow, the preparation screen, HUD and arena changes, the new tests and the README/CHANGELOG updates. Files: `src/game/abilities/`, `src/game/systems/{abilities,waveFlow,run,combat}.ts`, `src/game/scenes/{ArenaScene,PrepScene,HudScene,MenuScene}.ts`, `src/game/events.ts`, `src/input/inputState.ts`, `src/ui/GameShell.tsx`, docs. | Pending. | Lint, typecheck, `npm test` (40 tests) and `npm run build` passed. A Playwright browser check covered preparation, ability selection, wave starting only once, the pulse and its cooldown, the offline Scanner, the shield, and a clean restart. |

## Template preparation

On 10 October 2026, Codex prepared this documentation template from the organizer's supplied rules and checked the linked Luma page for the event name and dates. This covered `README.md`, `RULES.md`, `AGENTS.md`, `CHANGELOG.md`, `AI_USAGE.md`, `SUBMISSION.md`, `.gitignore`, and the pull request checklist. Agent validation covered local links, event consistency, required documents, and diff whitespace; organizer review is pending.

This preparation is separate from participant project implementation and participant AI usage during the event.
