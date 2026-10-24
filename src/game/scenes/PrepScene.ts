import * as Phaser from "phaser";
import { ABILITIES, ABILITY_ORDER, type AbilityId } from "../abilities/catalog";
import { ARENA, COLORS, FONT, SCENES } from "../constants";

export type PrepData = {
  clearedWave: number;
  equipped: AbilityId;
  onConfirm: (id: AbilityId) => void;
};

const CARD = { width: 340, height: 230, gap: 40, y: 360 };

export class PrepScene extends Phaser.Scene {
  private cards: { frame: Phaser.GameObjects.Rectangle; tag: Phaser.GameObjects.Text }[] = [];
  private selected = 0;
  private confirmed = false;

  constructor() {
    super(SCENES.prep);
  }

  create(data: PrepData) {
    this.cards = [];
    this.confirmed = false;
    this.selected = Math.max(0, ABILITY_ORDER.indexOf(data.equipped));
    const cx = ARENA.width / 2;

    this.add.rectangle(cx, ARENA.height / 2, ARENA.width, ARENA.height, COLORS.background, 0.82);
    this.add
      .text(cx, 120, `WAVE ${data.clearedWave} CLEARED`, { fontFamily: FONT, fontSize: "52px", color: "#fff35c" })
      .setOrigin(0.5)
      .setShadow(0, 0, "#fff35c", 16, true, true);
    this.add
      .text(cx, 180, "PREPARE: CHOOSE YOUR ABILITY", { fontFamily: FONT, fontSize: "24px", color: "#e8f7ff" })
      .setOrigin(0.5);

    const totalWidth = ABILITY_ORDER.length * CARD.width + (ABILITY_ORDER.length - 1) * CARD.gap;
    ABILITY_ORDER.forEach((id, index) => {
      const ability = ABILITIES[id];
      const x = cx - totalWidth / 2 + CARD.width / 2 + index * (CARD.width + CARD.gap);
      const frame = this.add
        .rectangle(x, CARD.y, CARD.width, CARD.height, 0x10101c)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.select(index));
      this.add
        .text(x, CARD.y - 80, `${index + 1}  ${ability.name}`, { fontFamily: FONT, fontSize: "28px", color: "#00f0ff" })
        .setOrigin(0.5);
      this.add
        .text(x, CARD.y - 10, ability.description, {
          fontFamily: FONT,
          fontSize: "17px",
          color: ability.available ? "#e8f7ff" : "#c9a6c4",
          align: "center",
          wordWrap: { width: CARD.width - 40 },
        })
        .setOrigin(0.5);
      const tag = this.add
        .text(x, CARD.y + 80, "", { fontFamily: FONT, fontSize: "18px", color: "#fff35c" })
        .setOrigin(0.5);
      if (!ability.available) {
        this.add
          .text(x, CARD.y + 140, "PLACEHOLDER - NOT AI YET", { fontFamily: FONT, fontSize: "16px", color: "#ff2bd6" })
          .setOrigin(0.5);
      }
      this.cards.push({ frame, tag });
    });

    const prompt = this.add
      .text(cx, 640, `<- -> OR 1-3 TO CHOOSE   ENTER TO START WAVE ${data.clearedWave + 1}`, {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#fff35c",
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });

    const keyboard = this.input.keyboard;
    keyboard?.on("keydown-LEFT", () => this.select(this.selected - 1));
    keyboard?.on("keydown-A", () => this.select(this.selected - 1));
    keyboard?.on("keydown-RIGHT", () => this.select(this.selected + 1));
    keyboard?.on("keydown-D", () => this.select(this.selected + 1));
    keyboard?.on("keydown-ONE", () => this.select(0));
    keyboard?.on("keydown-TWO", () => this.select(1));
    keyboard?.on("keydown-THREE", () => this.select(2));
    keyboard?.on("keydown-ENTER", () => this.confirm(data));

    this.renderSelection();
  }

  private select(index: number) {
    if (this.confirmed) return;
    const count = ABILITY_ORDER.length;
    this.selected = ((index % count) + count) % count;
    this.renderSelection();
  }

  private renderSelection() {
    this.cards.forEach(({ frame, tag }, index) => {
      const isSelected = index === this.selected;
      frame.setStrokeStyle(isSelected ? 4 : 2, isSelected ? COLORS.bullet : COLORS.grid);
      frame.setFillStyle(isSelected ? 0x1a1a2e : 0x10101c);
      tag.setText(isSelected ? "> EQUIPPED <" : "");
    });
  }

  private confirm(data: PrepData) {
    // Guards against a double Enter starting two waves.
    if (this.confirmed) return;
    this.confirmed = true;
    const id = ABILITY_ORDER[this.selected];
    this.scene.stop();
    data.onConfirm(id);
  }
}
