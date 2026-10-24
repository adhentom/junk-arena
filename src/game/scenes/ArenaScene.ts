import * as Phaser from "phaser";
import { BALANCE } from "../balance";
import { ARENA, COLORS, FONT, SCENES, TEXTURES } from "../constants";
import type { GameBus } from "../events";

import { applyDamage, createPlayerHealth, nearestTarget, type PlayerHealth } from "../systems/combat";
import {
  createScore,
  effectiveMultiplier,
  registerKill,
  registerPlayerHit,
  registerWaveClear,
  type ScoreState,
} from "../systems/scoring";
import { waveConfig } from "../systems/waves";
import { createInputState, movementVector, type InputState } from "../../input/inputState";
import { attachKeyboard } from "../../input/keyboard";

const PLAYER_BODY = { radius: 14, margin: 6 } as const;

type Sprite = Phaser.Physics.Arcade.Sprite;

export class ArenaScene extends Phaser.Scene {
  private bus!: GameBus;
  private controls!: InputState;
  private detachKeyboard: (() => void) | null = null;
  private player!: Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private health!: PlayerHealth;
  private score!: ScoreState;
  private wave = 0;
  private enemiesToSpawn = 0;
  private enemyHpMultiplier = 1;
  private enemySpeed: number = BALANCE.rustling.speed;
  private spawnBatch = 1;
  private waveActive = false;
  private nextFireAt = 0;
  private facing = new Phaser.Math.Vector2(1, 0);
  private isOver = false;

  constructor() {
    super(SCENES.arena);
  }

  create() {
    // Phaser reuses the scene instance on restart, so reset every field here.
    this.wave = 0;
    this.enemiesToSpawn = 0;
    this.enemyHpMultiplier = 1;
    this.enemySpeed = BALANCE.rustling.speed;
    this.spawnBatch = 1;
    this.waveActive = false;
    this.nextFireAt = 0;
    this.isOver = false;
    this.facing.set(1, 0);
    this.health = createPlayerHealth(BALANCE.player.maxHp);
    this.score = createScore();

    this.bus = this.registry.get("bus") as GameBus;
    this.controls = createInputState();
    this.detachKeyboard = attachKeyboard(window, this.controls);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    this.drawBackground();
    this.physics.world.setBounds(0, 0, ARENA.width, ARENA.height);

    this.player = this.physics.add.sprite(ARENA.width / 2, ARENA.height / 2, TEXTURES.player);
    this.player.setCircle(PLAYER_BODY.radius, PLAYER_BODY.margin, PLAYER_BODY.margin).setDepth(2);
    // Inset the bounds by the texture margin so the whole sprite stays visible at the edges.
    (this.player.body as Phaser.Physics.Arcade.Body).setBoundsRectangle(
      new Phaser.Geom.Rectangle(
        PLAYER_BODY.margin,
        PLAYER_BODY.margin,
        ARENA.width - PLAYER_BODY.margin * 2,
        ARENA.height - PLAYER_BODY.margin * 2,
      ),
    );
    this.player.setCollideWorldBounds(true);

    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.sparks = this.add.particles(0, 0, TEXTURES.spark, {
      speed: { min: 80, max: 280 },
      lifespan: 450,
      scale: { start: 1.2, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    this.sparks.setDepth(3);

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) =>
      this.onBulletHit(bullet as unknown as Sprite, enemy as unknown as Sprite),
    );
    this.physics.add.overlap(this.player, this.enemies, (_player, enemy) =>
      this.onPlayerTouched(enemy as unknown as Sprite),
    );

    this.scene.launch(SCENES.hud);
    // Keeps the HUD combo display honest when a combo expires without a new kill.
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.emitState() });
    this.startWave(1);
  }

  update() {
    if (this.isOver) return;
    const now = this.time.now;
    const { speed, fireIntervalMs } = BALANCE.player;

    const move = movementVector(this.controls);
    this.player.setVelocity(move.x * speed, move.y * speed);
    if (move.x !== 0 || move.y !== 0) this.facing.set(move.x, move.y);

    if (this.controls.fire && now >= this.nextFireAt) {
      this.fire(now);
      this.nextFireAt = now + fireIntervalMs;
    }

    for (const bullet of this.activeSprites(this.bullets)) {
      if (now >= (bullet.getData("expiresAt") as number)) bullet.destroy();
    }

    for (const enemy of this.activeSprites(this.enemies)) {
      this.physics.moveToObject(enemy, this.player, this.enemySpeed);
      enemy.rotation += 0.03;
    }

    if (this.waveActive && this.enemiesToSpawn === 0 && this.enemies.countActive(true) === 0) {
      this.clearWave();
    }
  }

  private startWave(wave: number) {
    const config = waveConfig(wave);
    this.wave = wave;
    this.enemiesToSpawn = config.enemyCount;
    this.enemyHpMultiplier = config.hpMultiplier;
    this.enemySpeed = BALANCE.rustling.speed * config.speedMultiplier;
    this.spawnBatch = config.spawnBatch;
    this.waveActive = true;
    this.showBanner(`WAVE ${wave}`, "#00f0ff");

    this.spawnTimer?.remove();
    this.spawnTimer = this.time.addEvent({
      delay: config.spawnIntervalMs,
      loop: true,
      callback: () => this.spawnTick(),
    });
    this.emitState();
  }

  private spawnTick() {
    if (this.enemiesToSpawn <= 0) {
      this.spawnTimer?.remove();
      this.spawnTimer = null;
      return;
    }
    for (let i = 0; i < this.spawnBatch && this.enemiesToSpawn > 0; i++) {
      if (this.enemies.countActive(true) >= BALANCE.waves.maxAliveEnemies) return;
      this.spawnEnemy();
      this.enemiesToSpawn -= 1;
    }
  }

  private spawnEnemy() {
    const margin = 20;
    const side = Phaser.Math.Between(0, 3);
    const x = side === 0 ? margin : side === 1 ? ARENA.width - margin : Phaser.Math.Between(margin, ARENA.width - margin);
    const y = side === 2 ? margin : side === 3 ? ARENA.height - margin : Phaser.Math.Between(margin, ARENA.height - margin);

    const enemy = this.enemies.create(x, y, TEXTURES.rustling) as Sprite;
    enemy.setCircle(13, 4, 4).setData("hp", Math.round(BALANCE.rustling.hp * this.enemyHpMultiplier));
    enemy.setScale(0);
    this.tweens.add({ targets: enemy, scale: 1, duration: 200 });
  }

  private clearWave() {
    this.waveActive = false;
    this.score = registerWaveClear(this.score, this.wave);
    this.showBanner(`WAVE ${this.wave} CLEAR  +${BALANCE.scoring.waveBonusPerWave * this.wave}`, "#fff35c");
    this.emitState();
    const nextWave = this.wave + 1;
    this.time.delayedCall(BALANCE.waves.breakMs, () => {
      if (!this.isOver) this.startWave(nextWave);
    });
  }

  private fire(now: number) {
    const { bulletSpeed, bulletLifetimeMs } = BALANCE.player;
    const target = nearestTarget(this.player, this.activeSprites(this.enemies));
    const direction = target
      ? new Phaser.Math.Vector2(target.x - this.player.x, target.y - this.player.y).normalize()
      : this.facing.clone();

    this.player.setRotation(direction.angle());
    const bullet = this.bullets.create(this.player.x, this.player.y, TEXTURES.bullet) as Sprite;
    bullet.setCircle(5, 2, 2).setData("expiresAt", now + bulletLifetimeMs);
    bullet.setVelocity(direction.x * bulletSpeed, direction.y * bulletSpeed);
  }

  private onBulletHit(bullet: Sprite, enemy: Sprite) {
    if (!bullet.active || !enemy.active) return;
    bullet.destroy();

    const hp = (enemy.getData("hp") as number) - BALANCE.player.bulletDamage;
    enemy.setData("hp", hp);
    if (hp <= 0) {
      this.killEnemy(enemy);
      return;
    }
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(60, () => {
      if (enemy.active) enemy.clearTint();
    });
  }

  private killEnemy(enemy: Sprite) {
    this.sparks.setParticleTint(COLORS.rustling);
    this.sparks.explode(14, enemy.x, enemy.y);
    enemy.destroy();
    this.score = registerKill(this.score, BALANCE.rustling.score, this.time.now);
    this.emitState();
  }

  private onPlayerTouched(enemy: Sprite) {
    if (this.isOver) return;
    const result = applyDamage(
      this.health,
      BALANCE.rustling.contactDamage,
      this.time.now,
      BALANCE.player.invulnerableMs,
    );
    if (!result.applied) return;

    this.health = result.health;
    this.score = registerPlayerHit(this.score);
    this.cameras.main.shake(140, 0.01);
    this.tweens.add({ targets: this.player, alpha: 0.25, duration: 75, yoyo: true, repeat: 3 });

    const away = new Phaser.Math.Vector2(enemy.x - this.player.x, enemy.y - this.player.y).normalize();
    enemy.setPosition(enemy.x + away.x * 60, enemy.y + away.y * 60);

    this.emitState();
    if (this.health.hp <= 0) this.endGame();
  }

  private endGame() {
    this.isOver = true;
    this.waveActive = false;
    this.physics.pause();
    this.player.setTint(COLORS.danger);
    this.sparks.setParticleTint(COLORS.player);
    this.sparks.explode(40, this.player.x, this.player.y);
    this.cameras.main.shake(300, 0.02);

    const summary = { score: this.score.points, wave: this.wave };
    this.bus.emit("game:over", summary);
    this.time.delayedCall(1000, () => this.scene.start(SCENES.gameOver, summary));
  }

  private emitState() {
    this.bus.emit("game:state", {
      score: this.score.points,
      wave: this.wave,
      hp: this.health.hp,
      maxHp: this.health.maxHp,
      multiplier: effectiveMultiplier(this.score, this.time.now),
    });
  }

  private showBanner(message: string, color: string) {
    const banner = this.add
      .text(ARENA.width / 2, ARENA.height / 2 - 140, message, { fontFamily: FONT, fontSize: "48px", color })
      .setOrigin(0.5)
      .setDepth(5)
      .setShadow(0, 0, color, 16, true, true);
    this.tweens.add({
      targets: banner,
      alpha: 0,
      y: banner.y - 40,
      delay: 900,
      duration: 500,
      onComplete: () => banner.destroy(),
    });
  }

  private drawBackground() {
    const grid = this.add.graphics().setDepth(-1);
    grid.lineStyle(1, COLORS.grid);
    for (let x = 0; x <= ARENA.width; x += 40) grid.lineBetween(x, 0, x, ARENA.height);
    for (let y = 0; y <= ARENA.height; y += 40) grid.lineBetween(0, y, ARENA.width, y);
    grid.lineStyle(3, COLORS.accent, 0.6).strokeRect(2, 2, ARENA.width - 4, ARENA.height - 4);
    this.cameras.main.setBackgroundColor(COLORS.background);
  }

  private activeSprites(group: Phaser.Physics.Arcade.Group): Sprite[] {
    return (group.getChildren() as Sprite[]).filter((sprite) => sprite.active);
  }

  private cleanup() {
    this.detachKeyboard?.();
    this.detachKeyboard = null;
    this.spawnTimer = null;
    this.scene.stop(SCENES.hud);
  }
}
