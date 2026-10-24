import { describe, expect, it } from "vitest";
import { createWaveFlow, endRun, enterPrep, markWaveCleared, startNextWave, type WaveFlow } from "./waveFlow";

function toPrep(): WaveFlow {
  let flow = startNextWave(createWaveFlow()).flow;
  flow = markWaveCleared(flow).flow;
  return enterPrep(flow).flow;
}

describe("waveFlow", () => {
  it("starts idle and begins wave 1", () => {
    const flow = createWaveFlow();
    expect(flow).toEqual({ phase: "idle", wave: 0 });
    expect(startNextWave(flow)).toEqual({ flow: { phase: "active", wave: 1 }, changed: true });
  });

  it("runs active -> cleared -> prep -> next wave", () => {
    const active = startNextWave(createWaveFlow()).flow;
    const cleared = markWaveCleared(active);
    expect(cleared.flow).toEqual({ phase: "cleared", wave: 1 });
    const prep = enterPrep(cleared.flow);
    expect(prep.flow).toEqual({ phase: "prep", wave: 1 });
    expect(startNextWave(prep.flow).flow).toEqual({ phase: "active", wave: 2 });
  });

  it("starts the next wave exactly once", () => {
    const first = startNextWave(toPrep());
    expect(first.changed).toBe(true);
    const second = startNextWave(first.flow);
    expect(second.changed).toBe(false);
    expect(second.flow).toEqual({ phase: "active", wave: 2 });
  });

  it("ignores out-of-order transitions", () => {
    const active = startNextWave(createWaveFlow()).flow;
    expect(enterPrep(active).changed).toBe(false);
    const cleared = markWaveCleared(active).flow;
    expect(markWaveCleared(cleared).changed).toBe(false);
    expect(startNextWave(cleared).changed).toBe(false);
  });

  it("locks every transition after the run ends", () => {
    const over = endRun(toPrep());
    expect(over.flow.phase).toBe("over");
    expect(startNextWave(over.flow).changed).toBe(false);
    expect(markWaveCleared(over.flow).changed).toBe(false);
    expect(enterPrep(over.flow).changed).toBe(false);
    expect(endRun(over.flow).changed).toBe(false);
  });
});
