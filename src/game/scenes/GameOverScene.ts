import * as Phaser from "phaser";
import { ARENA, COLORS, FONT, SCENES } from "../constants";
import type { GameOverEvent } from "../events";
import { loadBestScore, saveBestScore } from "../storage";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.gameOver);
  }

  create(data: GameOverEvent) {
    const cx = ARENA.width / 2;
    const previousBest = loadBestScore();
    const isNewBest = data.score > previousBest;
    if (isNewBest) saveBestScore(data.score);

    this.cameras.main.setBackgroundColor(COLORS.background);
    this.add
      .text(cx, 200, "SCRAPPED", { fontFamily: FONT, fontSize: "88px", color: "#ff3b5c" })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff3b5c", 24, true, true);

    this.add
      .text(cx, 330, `SCORE ${data.score}\nWAVE ${data.wave}`, {
        fontFamily: FONT,
        fontSize: "36px",
        color: "#e8f7ff",
        align: "center",
        lineSpacing: 12,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 430, isNewBest ? "NEW BEST!" : `BEST ${previousBest}`, {
        fontFamily: FONT,
        fontSize: "26px",
        color: isNewBest ? "#fff35c" : "#ff2bd6",
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, 560, "PRESS ENTER TO PLAY AGAIN", { fontFamily: FONT, fontSize: "28px", color: "#fff35c" })
      .setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start(SCENES.arena));
  }
}
