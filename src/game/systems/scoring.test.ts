import { describe, expect, it } from "vitest";
import {
  createScore,
  effectiveMultiplier,
  registerKill,
  registerPlayerHit,
  registerWaveClear,
} from "./scoring";

const rules = { comboWindowMs: 2000, comboStep: 0.5, maxMultiplier: 5, waveBonusPerWave: 100 };

describe("scoring", () => {
  it("scores the first kill at x1", () => {
    const state = registerKill(createScore(), 10, 1000, rules);
    expect(state).toEqual({ points: 10, multiplier: 1, kills: 1, lastKillAt: 1000 });
  });

  it("grows the multiplier for kills inside the combo window", () => {
    let state = registerKill(createScore(), 10, 0, rules);
    state = registerKill(state, 10, 1500, rules);
    state = registerKill(state, 10, 3000, rules);
    expect(state.multiplier).toBe(2);
    expect(state.points).toBe(10 + 15 + 20);
  });

  it("resets the multiplier when the combo window expires", () => {
    let state = registerKill(createScore(), 10, 0, rules);
    state = registerKill(state, 10, 1000, rules);
    state = registerKill(state, 10, 3001, rules);
    expect(state.multiplier).toBe(1);
  });

  it("caps the multiplier", () => {
    let state = createScore();
    for (let i = 0; i < 20; i++) state = registerKill(state, 10, i * 100, rules);
    expect(state.multiplier).toBe(5);
  });

  it("reports x1 once the combo has expired without a new kill", () => {
    let state = registerKill(createScore(), 10, 0, rules);
    state = registerKill(state, 10, 500, rules);
    expect(effectiveMultiplier(state, 2000, rules)).toBe(1.5);
    expect(effectiveMultiplier(state, 2501, rules)).toBe(1);
  });

  it("breaks the combo when the player is hit but keeps points", () => {
    let state = registerKill(createScore(), 10, 0, rules);
    state = registerKill(state, 10, 500, rules);
    state = registerPlayerHit(state);
    expect(state.multiplier).toBe(1);
    expect(state.points).toBe(25);
    expect(registerKill(state, 10, 600, rules).multiplier).toBe(1);
  });

  it("adds a wave clear bonus scaled by wave number", () => {
    expect(registerWaveClear(createScore(), 3, rules).points).toBe(300);
  });
});
