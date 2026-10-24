import { describe, expect, it } from "vitest";
import { BALANCE } from "../balance";
import { tryActivate } from "./abilities";
import { applyDamage, createPlayerHealth } from "./combat";
import { createRunState } from "./run";
import { registerKill } from "./scoring";
import { endRun, startNextWave } from "./waveFlow";

describe("createRunState", () => {
  it("gives a restart a clean run even after a finished one", () => {
    const finished = createRunState();
    finished.health = applyDamage(finished.health, 999, 0, 0).health;
    finished.score = registerKill(finished.score, 50, 0);
    finished.abilities = tryActivate({ equipped: "gadget", readyAt: 0, activeUntil: 0 }, 0).state;
    finished.flow = endRun(startNextWave(finished.flow).flow).flow;

    const restarted = createRunState();
    expect(restarted.health).toEqual(createPlayerHealth(BALANCE.player.maxHp));
    expect(restarted.score.points).toBe(0);
    expect(restarted.score.multiplier).toBe(1);
    expect(restarted.abilities).toEqual({ equipped: "shield", readyAt: 0, activeUntil: 0 });
    expect(restarted.flow).toEqual({ phase: "idle", wave: 0 });
    expect(restarted).not.toBe(finished);
  });
});
