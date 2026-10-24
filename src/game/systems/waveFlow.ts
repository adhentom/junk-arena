// Wave lifecycle: idle -> active -> cleared -> prep -> active (next wave) ... -> over.
export type WavePhase = "idle" | "active" | "cleared" | "prep" | "over";

export type WaveFlow = { phase: WavePhase; wave: number };

export type FlowStep = { flow: WaveFlow; changed: boolean };

export function createWaveFlow(): WaveFlow {
  return { phase: "idle", wave: 0 };
}

const unchanged = (flow: WaveFlow): FlowStep => ({ flow, changed: false });

/** Starts the first wave from idle or the next wave from prep. Any other call is ignored. */
export function startNextWave(flow: WaveFlow): FlowStep {
  if (flow.phase !== "idle" && flow.phase !== "prep") return unchanged(flow);
  return { flow: { phase: "active", wave: flow.wave + 1 }, changed: true };
}

export function markWaveCleared(flow: WaveFlow): FlowStep {
  if (flow.phase !== "active") return unchanged(flow);
  return { flow: { ...flow, phase: "cleared" }, changed: true };
}

export function enterPrep(flow: WaveFlow): FlowStep {
  if (flow.phase !== "cleared") return unchanged(flow);
  return { flow: { ...flow, phase: "prep" }, changed: true };
}

export function endRun(flow: WaveFlow): FlowStep {
  if (flow.phase === "over") return unchanged(flow);
  return { flow: { ...flow, phase: "over" }, changed: true };
}
