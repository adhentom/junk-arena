export type PlayerHealth = {
  hp: number;
  maxHp: number;
  invulnerableUntil: number;
};

export type Point = { x: number; y: number };

export function createPlayerHealth(maxHp: number): PlayerHealth {
  return { hp: maxHp, maxHp, invulnerableUntil: 0 };
}

export function applyDamage(
  health: PlayerHealth,
  amount: number,
  now: number,
  invulnerableMs: number,
): { health: PlayerHealth; applied: boolean } {
  if (health.hp <= 0 || now < health.invulnerableUntil || amount <= 0) {
    return { health, applied: false };
  }
  return {
    health: {
      ...health,
      hp: Math.max(0, health.hp - amount),
      invulnerableUntil: now + invulnerableMs,
    },
    applied: true,
  };
}

export type ContactResult = { health: PlayerHealth; applied: boolean; blocked: boolean };

export function applyContactDamage(
  health: PlayerHealth,
  amount: number,
  now: number,
  invulnerableMs: number,
  shielded: boolean,
): ContactResult {
  if (shielded) return { health, applied: false, blocked: true };
  return { ...applyDamage(health, amount, now, invulnerableMs), blocked: false };
}

export function targetsInRadius<T extends Point>(origin: Point, targets: readonly T[], radius: number): T[] {
  const limit = radius * radius;
  return targets.filter((target) => (target.x - origin.x) ** 2 + (target.y - origin.y) ** 2 <= limit);
}

export function nearestTarget<T extends Point>(origin: Point, targets: readonly T[]): T | null {
  let best: T | null = null;
  let bestDistance = Infinity;
  for (const target of targets) {
    const distance = (target.x - origin.x) ** 2 + (target.y - origin.y) ** 2;
    if (distance < bestDistance) {
      best = target;
      bestDistance = distance;
    }
  }
  return best;
}
