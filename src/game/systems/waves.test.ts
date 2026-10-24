import { describe, expect, it } from "vitest";
import { waveConfig } from "./waves";

const rules = {
  baseEnemies: 6,
  enemiesPerWave: 3,
  hpGrowthPerWave: 0.12,
  speedGrowthPerWave: 0.08,
  spawnBatchEveryWaves: 2,
  maxSpawnBatch: 4,
  baseSpawnIntervalMs: 900,
  spawnIntervalStepMs: 60,
  minSpawnIntervalMs: 300,
  maxAliveEnemies: 40,
  breakMs: 2500,
};

describe("waveConfig", () => {
  it("defines wave 1", () => {
    expect(waveConfig(1, rules)).toEqual({
      enemyCount: 9,
      hpMultiplier: 1,
      speedMultiplier: 1,
      spawnIntervalMs: 900,
      spawnBatch: 1,
    });
  });

  it("escalates enemy count and health each wave", () => {
    const wave3 = waveConfig(3, rules);
    expect(wave3.enemyCount).toBe(15);
    expect(wave3.hpMultiplier).toBeCloseTo(1.24);
    expect(wave3.speedMultiplier).toBeCloseTo(1.16);
    expect(wave3.spawnIntervalMs).toBe(780);
    expect(wave3.spawnBatch).toBe(2);
  });

  it("never spawns faster than the floor or in bigger batches than the cap", () => {
    expect(waveConfig(50, rules).spawnIntervalMs).toBe(300);
    expect(waveConfig(50, rules).spawnBatch).toBe(4);
  });

  it("rejects invalid wave numbers", () => {
    expect(() => waveConfig(0, rules)).toThrow(RangeError);
    expect(() => waveConfig(1.5, rules)).toThrow(RangeError);
  });
});
