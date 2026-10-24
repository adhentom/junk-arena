import * as Phaser from "phaser";
import { ABILITIES, type AbilityId } from "../abilities/catalog";
import { BALANCE } from "../balance";
import { ARENA, COLORS, FONT, SCENES, TEXTURES } from "../constants";
import type { GameBus } from "../events";
import { abilityStatus, blocksDamage, equipAbility, tryActivate } from "../systems/abilities";
import { applyContactDamage, nearestTarget, targetsInRadius } from "../systems/combat";
import { createRunState, type RunState } from "../systems/run";
import { effectiveMultiplier, registerKill, registerPlayerHit, registerWaveClear } from "../systems/scoring";
import { endRun, enterPrep, markWaveCleared, startNextWave } from "../systems/waveFlow";
import { waveConfig } from "../systems/waves";
import { createInputState, movementVector, type InputState } from "../../input/inputState";
import { attachKeyboard } from "../../input/keyboard";
import type { PrepData } from "./PrepScene";

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
  private shieldRing!: Phaser.GameObjects.Arc;
  private pulseRing!: Phaser.GameObjects.Arc;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private run!: RunState;
  private enemiesToSpawn = 0;
  private enemyHpMultiplier = 1;
  private enemySpeed: number = BALANCE.rustling.speed;
  private spawnBatch = 1;
  private nextFireAt = 0;
  private abilityKeyHeld = false;
  private shieldWasUp = false;
  private facing = new Phaser.Math.Vector2(1, 0);

  constructor() {
    super(SCENES.arena);
  }

  create() {
    // Phaser reuses the scene instance on restart, so reset every field here.
    this.run = createRunState();
    this.enemiesToSpawn = 0;
    this.enemyHpMultiplier = 1;
    this.enemySpeed = BALANCE.rustling.speed;
    this.spawnBatch = 1;
    this.nextFireAt = 0;
    this.abilityKeyHeld = false;
    this.shieldWasUp = false;
    this.spawnTimer = null;
    this.facing.set(1, 0);

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

    // Ability visuals are created once and reused, so activations never pile up objects.
    this.shieldRing = this.add.circle(0, 0, 30, COLORS.shield, 0.12).setStrokeStyle(3, COLORS.shield);
    this.shieldRing.setDepth(3).setVisible(false);
    this.pulseRing = this.add.circle(0, 0, BALANCE.abilities.gadget.radius).setStrokeStyle(6, COLORS.accent);
    this.pulseRing.setDepth(3).setVisible(false);

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
    // Keeps the HUD combo and cooldown displays honest between events.
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.emitState() });
    this.beginNextWave();
  }

  update() {
    if (this.run.flow.phase === "over") return;
    const now = this.time.now;
    const { speed, fireIntervalMs } = BALANCE.player;

    const move = movementVector(this.controls);
    this.player.setVelocity(move.x * speed, move.y * speed);
    if (move.x !== 0 || move.y !== 0) this.facing.set(move.x, move.y);

    if (this.controls.fire && now >= this.nextFireAt) {
      this.fire(now);
      this.nextFireAt = now + fireIntervalMs;
    }

    // Edge-triggered: holding the key activates once.
    if (this.controls.ability && !this.abilityKeyHeld) this.activateAbility(now);
    this.abilityKeyHeld = this.controls.ability;
    this.updateShield(now);

    for (const bullet of this.activeSprites(this.bullets)) {
      if (now >= (bullet.getData("expiresAt") as number)) bullet.destroy();
    }

    for (const enemy of this.activeSprites(this.enemies)) {
      this.physics.moveToObject(enemy, this.player, this.enemySpeed);
      enemy.rotation += 0.03;
    }

    if (this.run.flow.phase === "active" && this.enemiesToSpawn === 0 && this.enemies.countActive(true) === 0) {
      this.clearWave();
    }
  }

  private beginNextWave() {
    const step = startNextWave(this.run.flow);
    if (!step.changed) return;
    this.run.flow = step.flow;

    const config = waveConfig(step.flow.wave);
    this.enemiesToSpawn = config.enemyCount;
    this.enemyHpMultiplier = config.hpMultiplier;
    this.enemySpeed = BALANCE.rustling.speed * config.speedMultiplier;
    this.spawnBatch = config.spawnBatch;
    this.showBanner(`WAVE ${step.flow.wave}`, "#00f0ff");

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
    const step = markWaveCleared(this.run.flow);
    if (!step.changed) return;
    this.run.flow = step.flow;
    const wave = step.flow.wave;
    this.run.score = registerWaveClear(this.run.score, wave);
    this.showBanner(`WAVE ${wave} CLEAR  +${BALANCE.scoring.waveBonusPerWave * wave}`, "#fff35c");
    this.emitState();
    this.time.delayedCall(BALANCE.waves.clearDelayMs, () => this.openPrep());
  }

  private openPrep() {
    const step = enterPrep(this.run.flow);
    if (!step.changed) return;
    this.run.flow = step.flow;

    this.bullets.clear(true, true);
    this.player.setVelocity(0, 0);
    this.emitState();

    const data: PrepData = {
      clearedWave: step.flow.wave,
      equipped: this.run.abilities.equipped,
      onConfirm: (id) => this.confirmPrep(id),
    };
    this.scene.launch(SCENES.prep, data);
    this.scene.pause();
  }

  private confirmPrep(id: AbilityId) {
    if (this.run.flow.phase !== "prep") return;
    this.run.abilities = equipAbility(id);
    this.shieldRing.setVisible(false);
    this.shieldWasUp = false;
    this.scene.resume();
    this.beginNextWave();
  }

  private activateAbility(now: number) {
    const { state, result } = tryActivate(this.run.abilities, now);
    this.run.abilities = state;
    const definition = ABILITIES[state.equipped];

    if (result === "unavailable") {
      this.floatText("SCANNER OFFLINE - NO AI SCAN YET", "#ff2bd6");
    } else if (result === "cooldown") {
      const seconds = (abilityStatus(state, now).remainingMs / 1000).toFixed(1);
      this.floatText(`${definition.name} COOLDOWN ${seconds}s`, "#ff3b5c");
      this.tweens.add({ targets: this.player, x: this.player.x + 4, duration: 40, yoyo: true, repeat: 2 });
    } else if (state.equipped === "shield") {
      this.floatText("SHIELD UP", "#7cf9ff");
    } else if (state.equipped === "gadget") {
      this.shockPulse();
    }
    this.emitState();
  }

  private updateShield(now: number) {
    const up = blocksDamage(this.run.abilities, now);
    if (up) {
      this.shieldRing.setPosition(this.player.x, this.player.y).setVisible(true);
      this.shieldRing.setScale(1 + Math.sin(now / 80) * 0.05);
    } else if (this.shieldWasUp) {
      this.shieldRing.setVisible(false);
      this.floatText("SHIELD DOWN", "#7cf9ff");
      this.emitState();
    }
    this.shieldWasUp = up;
  }

  private shockPulse() {
    const { radius, damage, knockback } = BALANCE.abilities.gadget;
    this.tweens.killTweensOf(this.pulseRing);
    this.pulseRing.setPosition(this.player.x, this.player.y).setScale(0.1).setAlpha(1).setVisible(true);
    this.tweens.add({
      targets: this.pulseRing,
      scale: 1,
      alpha: 0,
      duration: 260,
      onComplete: () => this.pulseRing.setVisible(false),
    });
    this.cameras.main.shake(120, 0.006);

    for (const enemy of targetsInRadius(this.player, this.activeSprites(this.enemies), radius)) {
      const away = new Phaser.Math.Vector2(enemy.x - this.player.x, enemy.y - this.player.y).normalize();
      enemy.setPosition(enemy.x + away.x * knockback, enemy.y + away.y * knockback);
      this.damageEnemy(enemy, damage);
    }
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
    this.damageEnemy(enemy, BALANCE.player.bulletDamage);
  }

  private damageEnemy(enemy: Sprite, amount: number) {
    const hp = (enemy.getData("hp") as number) - amount;
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
    this.run.score = registerKill(this.run.score, BALANCE.rustling.score, this.time.now);
    this.emitState();
  }

  private onPlayerTouched(enemy: Sprite) {
    if (this.run.flow.phase === "over") return;
    const now = this.time.now;
    const result = applyContactDamage(
      this.run.health,
      BALANCE.rustling.contactDamage,
      now,
      BALANCE.player.invulnerableMs,
      blocksDamage(this.run.abilities, now),
    );

    const away = new Phaser.Math.Vector2(enemy.x - this.player.x, enemy.y - this.player.y).normalize();
    if (result.blocked) {
      enemy.setPosition(enemy.x + away.x * 60, enemy.y + away.y * 60);
      this.sparks.setParticleTint(COLORS.shield);
      this.sparks.explode(6, enemy.x, enemy.y);
      return;
    }
    if (!result.applied) return;

    this.run.health = result.health;
    this.run.score = registerPlayerHit(this.run.score);
    this.cameras.main.shake(140, 0.01);
    this.tweens.add({ targets: this.player, alpha: 0.25, duration: 75, yoyo: true, repeat: 3 });
    enemy.setPosition(enemy.x + away.x * 60, enemy.y + away.y * 60);

    this.emitState();
    if (this.run.health.hp <= 0) this.endGame();
  }

  private endGame() {
    const step = endRun(this.run.flow);
    if (!step.changed) return;
    this.run.flow = step.flow;
    this.spawnTimer?.remove();
    this.spawnTimer = null;
    this.physics.pause();
    this.shieldRing.setVisible(false);
    this.player.setTint(COLORS.danger);
    this.sparks.setParticleTint(COLORS.player);
    this.sparks.explode(40, this.player.x, this.player.y);
    this.cameras.main.shake(300, 0.02);

    const summary = { score: this.run.score.points, wave: this.run.flow.wave };
    this.bus.emit("game:over", summary);
    this.emitState();
    this.time.delayedCall(1000, () => this.scene.start(SCENES.gameOver, summary));
  }

  private emitState() {
    const now = this.time.now;
    const { equipped } = this.run.abilities;
    const { status, remainingMs } = abilityStatus(this.run.abilities, now);
    this.bus.emit("game:state", {
      score: this.run.score.points,
      wave: this.run.flow.wave,
      hp: this.run.health.hp,
      maxHp: this.run.health.maxHp,
      multiplier: effectiveMultiplier(this.run.score, now),
      phase: this.run.flow.phase,
      ability: { id: equipped, name: ABILITIES[equipped].name, status, remainingMs },
    });
  }

  private floatText(message: string, color: string) {
    const text = this.add
      .text(this.player.x, this.player.y - 40, message, { fontFamily: FONT, fontSize: "18px", color })
      .setOrigin(0.5)
      .setDepth(5);
    this.tweens.add({ targets: text, y: text.y - 30, alpha: 0, duration: 900, onComplete: () => text.destroy() });
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
    this.scene.stop(SCENES.prep);
    this.scene.stop(SCENES.hud);
  }
}
