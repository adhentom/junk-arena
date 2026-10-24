import { BALANCE } from "../balance";
import { createAbilityState, type AbilityState } from "./abilities";
import { createPlayerHealth, type PlayerHealth } from "./combat";
import { createScore, type ScoreState } from "./scoring";
import { createWaveFlow, type WaveFlow } from "./waveFlow";

export type RunState = {
  health: PlayerHealth;
  score: ScoreState;
  abilities: AbilityState;
  flow: WaveFlow;
};

/** Everything a fresh run starts with. The arena calls this on every (re)start. */
export function createRunState(): RunState {
  return {
    health: createPlayerHealth(BALANCE.player.maxHp),
    score: createScore(),
    abilities: createAbilityState(),
    flow: createWaveFlow(),
  };
}
