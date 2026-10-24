import * as Phaser from "phaser";
import { COLORS, FONT, SCENES } from "../constants";
import type { GameBus, GameStateEvent } from "../events";

const BAR = { x: 24, y: 24, width: 260, height: 18 };

export class HudScene extends Phaser.Scene {
  private bar!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.hud);
  }

  create() {
    const style = { fontFamily: FONT, fontSize: "22px", color: "#e8f7ff" };
    this.bar = this.add.graphics();
    this.scoreText = this.add.text(BAR.x, 54, "", style);
    this.waveText = this.add.text(1256, 24, "", style).setOrigin(1, 0);
    this.comboText = this.add.text(1256, 54, "", { ...style, color: "#ff2bd6" }).setOrigin(1, 0);

    const bus = this.registry.get("bus") as GameBus;
    const off = bus.on("game:state", (state) => this.render(state));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
  }

  private render(state: GameStateEvent) {
    const ratio = state.maxHp > 0 ? state.hp / state.maxHp : 0;
    this.bar.clear();
    this.bar.fillStyle(0x222233).fillRect(BAR.x, BAR.y, BAR.width, BAR.height);
    this.bar.fillStyle(ratio > 0.3 ? COLORS.player : COLORS.danger);
    this.bar.fillRect(BAR.x, BAR.y, BAR.width * ratio, BAR.height);
    this.bar.lineStyle(2, 0xe8f7ff, 0.6).strokeRect(BAR.x, BAR.y, BAR.width, BAR.height);

    this.scoreText.setText(`SCORE ${state.score}`);
    this.waveText.setText(`WAVE ${state.wave}`);
    this.comboText.setText(state.multiplier > 1 ? `COMBO x${state.multiplier}` : "");
  }
}
