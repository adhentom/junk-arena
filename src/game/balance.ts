// Every tunable gameplay number lives here so balancing never touches scene code.
export const BALANCE = {
  player: {
    maxHp: 100,
    speed: 280,
    invulnerableMs: 600,
    fireIntervalMs: 180,
    bulletSpeed: 700,
    bulletDamage: 10,
    bulletLifetimeMs: 900,
  },
  rustling: {
    hp: 20,
    speed: 125,
    contactDamage: 10,
    score: 10,
  },
  waves: {
    baseEnemies: 8,
    enemiesPerWave: 3,
    hpGrowthPerWave: 0.12,
    speedGrowthPerWave: 0.08,
    spawnBatchEveryWaves: 2,
    maxSpawnBatch: 4,
    baseSpawnIntervalMs: 750,
    spawnIntervalStepMs: 60,
    minSpawnIntervalMs: 300,
    maxAliveEnemies: 40,
    breakMs: 2500,
  },
  scoring: {
    comboWindowMs: 2000,
    comboStep: 0.5,
    maxMultiplier: 5,
    waveBonusPerWave: 100,
  },
} as const;
