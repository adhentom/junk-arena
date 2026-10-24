import { BALANCE } from "../balance";

export type WaveConfig = {
  enemyCount: number;
  hpMultiplier: number;
  speedMultiplier: number;
  spawnIntervalMs: number;
  spawnBatch: number;
};

export type WaveRules = {
  baseEnemies: number;
  enemiesPerWave: number;
  hpGrowthPerWave: number;
  speedGrowthPerWave: number;
  spawnBatchEveryWaves: number;
  maxSpawnBatch: number;
  baseSpawnIntervalMs: number;
  spawnIntervalStepMs: number;
  minSpawnIntervalMs: number;
};

export function waveConfig(wave: number, rules: WaveRules = BALANCE.waves): WaveConfig {
  if (!Number.isInteger(wave) || wave < 1) {
    throw new RangeError(`Wave must be a positive integer, got ${wave}`);
  }
  return {
    enemyCount: rules.baseEnemies + rules.enemiesPerWave * wave,
    hpMultiplier: 1 + rules.hpGrowthPerWave * (wave - 1),
    speedMultiplier: 1 + rules.speedGrowthPerWave * (wave - 1),
    spawnIntervalMs: Math.max(
      rules.minSpawnIntervalMs,
      rules.baseSpawnIntervalMs - rules.spawnIntervalStepMs * (wave - 1),
    ),
    spawnBatch: Math.min(rules.maxSpawnBatch, 1 + Math.floor((wave - 1) / rules.spawnBatchEveryWaves)),
  };
}
