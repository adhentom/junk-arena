import * as Phaser from "phaser";
import { COLORS, SCENES, TEXTURES } from "../constants";

// All art is generated from vector shapes at boot: no asset files to load or license.
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create() {
    const g = this.add.graphics();

    g.fillStyle(COLORS.player, 0.18).fillCircle(20, 20, 18);
    g.lineStyle(3, COLORS.player).strokeTriangle(35, 20, 8, 7, 8, 33);
    g.fillStyle(COLORS.player).fillCircle(16, 20, 4);
    g.generateTexture(TEXTURES.player, 40, 40).clear();

    const jagged = [
      { x: 17, y: 2 }, { x: 24, y: 9 }, { x: 32, y: 10 }, { x: 27, y: 18 },
      { x: 31, y: 28 }, { x: 21, y: 26 }, { x: 15, y: 32 }, { x: 11, y: 24 },
      { x: 2, y: 22 }, { x: 8, y: 15 }, { x: 4, y: 6 }, { x: 12, y: 8 },
    ];
    g.fillStyle(COLORS.rustling, 0.22).fillPoints(jagged, true);
    g.lineStyle(2, COLORS.rustling).strokePoints(jagged, true);
    g.fillStyle(COLORS.rustling).fillRect(14, 14, 6, 6);
    g.generateTexture(TEXTURES.rustling, 34, 34).clear();

    g.fillStyle(COLORS.bullet, 0.3).fillCircle(7, 7, 7);
    g.fillStyle(COLORS.bullet).fillCircle(7, 7, 4);
    g.generateTexture(TEXTURES.bullet, 14, 14).clear();

    g.fillStyle(0xffffff).fillRect(0, 0, 6, 6);
    g.generateTexture(TEXTURES.spark, 6, 6).destroy();

    this.scene.start(SCENES.menu);
  }
}
