import * as Phaser from "phaser";
import { ARENA, COLORS } from "./constants";
import type { GameBus } from "./events";
import { ArenaScene } from "./scenes/ArenaScene";
import { BootScene } from "./scenes/BootScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { HudScene } from "./scenes/HudScene";
import { MenuScene } from "./scenes/MenuScene";

export function createGame(parent: HTMLElement, bus: GameBus): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: ARENA.width,
    height: ARENA.height,
    backgroundColor: COLORS.background,
    physics: { default: "arcade", arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, MenuScene, ArenaScene, HudScene, GameOverScene],
    callbacks: {
      preBoot: (game) => game.registry.set("bus", bus),
    },
  });
}
