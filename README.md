# DevDay Exchange Community Hackathon: Kochi

A repository template for participants at the 10–11 October 2026 hackathon. It contains event rules and documentation scaffolding; build your project from scratch at the event.

**[Event and registration on Luma](https://luma.com/z10nz8gp)** · **[Event rules](RULES.md)** · **[Agent instructions](AGENTS.md)**

## Event details

| Detail | Information |
| --- | --- |
| Venue | JAIN University, Kochi |
| Location | [Open the venue map](https://maps.app.goo.gl/Eme7gR7NDXSNRANu5) |
| Rooms | 2008 and 2009 |
| Check-in | 10 October 2026, 6:00 PM IST |
| Kick-off | 10 October 2026, 6:30 PM IST |
| Wrap-up | 11 October 2026, by 10:00 AM IST |
| Participation | Solo or a team of up to 4 participants |
| Theme | Open — build anything you like |

Keep your approved Luma QR code ready for entry, and bring your laptop and charger. Eligible checked-in participants will receive Codex credits and OpenAI API credits.

## Use this template

1. Select **Use this template → Create a new repository** on GitHub. Create your own project repository and clone it.
2. Read [RULES.md](RULES.md) and [AGENTS.md](AGENTS.md) before building. Begin project implementation at the event.
3. Fill in the project overview below as you build. Use any suitable language or framework, keeping the implementation simple.
4. Record meaningful changes in [CHANGELOG.md](CHANGELOG.md) and your Codex usage in [AI_USAGE.md](AI_USAGE.md). Commit after completed milestones; aim for a meaningful checkpoint about every 30 minutes.
5. Complete [SUBMISSION.md](SUBMISSION.md) with your code repository, short project description, and working demo. Follow submission instructions announced by the organizers.

This template has no application code or required technology stack. The documentation and commit cadence are repository workflow guidance; the event participation rules are in [RULES.md](RULES.md).

## Project overview — complete during the event

- **Project name:** JUNK//ARENA
- **Short description:** An arcade survival game where you scan everyday junk with your webcam and AI turns it into weapons, shields, traps, or abilities, while you fight swarms with hand gestures. **Current build:** a keyboard-playable arena with abilities and a preparation phase between waves. Camera, gestures and AI scanning are not implemented yet.
- **Team:** Adhen ([@adhentom](https://github.com/adhentom))
- **Working demo:** Local only for now. See "Run the project" below.
- **Technology stack:** Next.js 16 (App Router), TypeScript, Phaser 3.90, Vitest. Planned: MediaPipe Tasks Vision, Zod, and a server-side vision model API.

### Run the project

1. Prerequisites: Node.js 22.12 or newer (tested with Node 24.19.0) and npm.
2. Install dependencies: `npm install`
3. Environment setup: none needed yet. No API keys are used.
4. Start the project: `npm run dev`, then open <http://localhost:3000>. For a production build, run `npm run build && npm start`.
5. Run checks: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

### How to play (current build)

- **Enter:** start, or play again after Game Over.
- **WASD / arrow keys:** move.
- **Space (hold):** fire. Shots auto-aim at the nearest enemy.
- **E or Shift:** use your equipped ability. Pressing it while on cooldown shows the time remaining and does nothing.
- **Preparation (between waves):** ← → or 1–3 to choose an ability (or click a card), then Enter to start the next wave.
- Survive waves of Rustlings. Kills chain into a combo multiplier (up to ×5) that resets when you get hit. Clearing a wave gives a bonus. Your best score is saved in this browser.
- Abilities:
  - **Shield:** blocks all contact damage for 2.5 s, with a 9 s cooldown.
  - **Shock Pulse:** deals 30 damage to enemies within 220 px and knocks them back, with a 6 s cooldown.
  - **Scanner:** a placeholder for the future AI object scan. You can equip it, but it does nothing yet and says so on screen.
  - You start each run with Shield. Choosing an ability in the preparation phase also gives you a fresh, ready copy of it.

### Current status

- Working features: menu, keyboard movement, auto-aim blaster, Rustling enemies that chase you, escalating waves (more enemies, more HP, faster, spawning in bigger batches), HP with brief invulnerability after a hit, score with combo multiplier and wave bonus, Game Over and restart, local best score, three abilities (Shield, Shock Pulse, and a Scanner placeholder) with cooldowns shown in the HUD, a preparation phase after each cleared wave, and screen-reader status text that includes the preparation phase and ability status.
- Known limitations: no camera, hand gestures, AI object scanning, sound, or deployed demo yet. Balance has only been checked with automated playtests on a VM with software WebGL. Performance on real laptops still needs checking.
- Libraries, APIs, and public datasets used: [Next.js](https://github.com/vercel/next.js) (MIT), [React](https://github.com/facebook/react) (MIT), [Phaser](https://github.com/phaserjs/phaser) (MIT), [Vitest](https://github.com/vitest-dev/vitest) (MIT), [TypeScript](https://github.com/microsoft/TypeScript) (Apache-2.0), [ESLint](https://github.com/eslint/eslint) (MIT). All game art is drawn in code at runtime; there are no external assets.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
