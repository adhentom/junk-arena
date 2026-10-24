import { describe, expect, it } from "vitest";
import { applyDamage, createPlayerHealth, nearestTarget } from "./combat";

describe("applyDamage", () => {
  it("reduces hp and starts invulnerability", () => {
    const { health, applied } = applyDamage(createPlayerHealth(100), 10, 1000, 600);
    expect(applied).toBe(true);
    expect(health).toEqual({ hp: 90, maxHp: 100, invulnerableUntil: 1600 });
  });

  it("ignores damage while invulnerable", () => {
    const first = applyDamage(createPlayerHealth(100), 10, 1000, 600).health;
    const second = applyDamage(first, 10, 1599, 600);
    expect(second.applied).toBe(false);
    expect(second.health.hp).toBe(90);
    expect(applyDamage(first, 10, 1600, 600).health.hp).toBe(80);
  });

  it("never drops below zero and ignores hits after death", () => {
    const dead = applyDamage(createPlayerHealth(5), 10, 0, 0).health;
    expect(dead.hp).toBe(0);
    expect(applyDamage(dead, 10, 1000, 0).applied).toBe(false);
  });
});

describe("nearestTarget", () => {
  it("returns the closest target", () => {
    const targets = [{ x: 100, y: 0 }, { x: 5, y: 5 }, { x: -50, y: 0 }];
    expect(nearestTarget({ x: 0, y: 0 }, targets)).toBe(targets[1]);
  });

  it("returns null when there are no targets", () => {
    expect(nearestTarget({ x: 0, y: 0 }, [])).toBeNull();
  });
});
