import { BALANCE } from "../balance";

export type ScoreState = {
  points: number;
  multiplier: number;
  kills: number;
  lastKillAt: number | null;
};

export type ScoringRules = {
  comboWindowMs: number;
  comboStep: number;
  maxMultiplier: number;
  waveBonusPerWave: number;
};

export function createScore(): ScoreState {
  return { points: 0, multiplier: 1, kills: 0, lastKillAt: null };
}

function comboAlive(state: ScoreState, now: number, rules: ScoringRules): boolean {
  return state.lastKillAt !== null && now - state.lastKillAt <= rules.comboWindowMs;
}

export function registerKill(
  state: ScoreState,
  baseValue: number,
  now: number,
  rules: ScoringRules = BALANCE.scoring,
): ScoreState {
  const multiplier = comboAlive(state, now, rules)
    ? Math.min(rules.maxMultiplier, state.multiplier + rules.comboStep)
    : 1;
  return {
    points: state.points + Math.round(baseValue * multiplier),
    multiplier,
    kills: state.kills + 1,
    lastKillAt: now,
  };
}

export function effectiveMultiplier(
  state: ScoreState,
  now: number,
  rules: ScoringRules = BALANCE.scoring,
): number {
  return comboAlive(state, now, rules) ? state.multiplier : 1;
}

export function registerPlayerHit(state: ScoreState): ScoreState {
  return { ...state, multiplier: 1, lastKillAt: null };
}

export function registerWaveClear(
  state: ScoreState,
  wave: number,
  rules: ScoringRules = BALANCE.scoring,
): ScoreState {
  return { ...state, points: state.points + rules.waveBonusPerWave * wave };
}
