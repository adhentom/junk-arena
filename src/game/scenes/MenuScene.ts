import * as Phaser from "phaser";
import { ARENA, COLORS, FONT, SCENES } from "../constants";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.menu);
  }

  create() {
    const cx = ARENA.width / 2;

    this.add
      .text(cx, 220, "JUNK//ARENA", { fontFamily: FONT, fontSize: "96px", color: "#00f0ff" })
      .setOrigin(0.5)
      .setShadow(0, 0, "#00f0ff", 24, true, true);

    this.add
      .text(cx, 310, "SURVIVE THE JUNK SWARM", { fontFamily: FONT, fontSize: "24px", color: "#ff2bd6" })
      .setOrigin(0.5);

    this.add
      .text(cx, 420, "MOVE     WASD / ARROWS\nFIRE     SPACE (auto-aims)\nABILITY  E / SHIFT", {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#e8f7ff",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, 560, "PRESS ENTER TO START", { fontFamily: FONT, fontSize: "28px", color: "#fff35c" })
      .setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this.cameras.main.setBackgroundColor(COLORS.background);
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start(SCENES.arena));
  }
}
