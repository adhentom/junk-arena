import { ABILITIES, type AbilityDefinition, type AbilityId } from "../abilities/catalog";

export type AbilityState = {
  equipped: AbilityId;
  readyAt: number;
  activeUntil: number;
};

export type ActivationResult = "activated" | "cooldown" | "unavailable";
export type AbilityStatus = "ready" | "active" | "cooldown" | "unavailable";

type Catalog = Readonly<Record<AbilityId, Pick<AbilityDefinition, "cooldownMs" | "durationMs" | "available">>>;

export function createAbilityState(equipped: AbilityId = "shield"): AbilityState {
  return { equipped, readyAt: 0, activeUntil: 0 };
}

/** Equipping (or re-equipping) during preparation hands the player a fresh, ready ability. */
export function equipAbility(id: AbilityId): AbilityState {
  return createAbilityState(id);
}

export function tryActivate(
  state: AbilityState,
  now: number,
  catalog: Catalog = ABILITIES,
): { state: AbilityState; result: ActivationResult } {
  const definition = catalog[state.equipped];
  if (!definition.available) return { state, result: "unavailable" };
  if (now < state.readyAt) return { state, result: "cooldown" };
  return {
    state: { ...state, readyAt: now + definition.cooldownMs, activeUntil: now + definition.durationMs },
    result: "activated",
  };
}

export function isActive(state: AbilityState, now: number): boolean {
  return now < state.activeUntil;
}

export function blocksDamage(state: AbilityState, now: number): boolean {
  return state.equipped === "shield" && isActive(state, now);
}

export function abilityStatus(
  state: AbilityState,
  now: number,
  catalog: Catalog = ABILITIES,
): { status: AbilityStatus; remainingMs: number } {
  if (!catalog[state.equipped].available) return { status: "unavailable", remainingMs: 0 };
  if (now < state.activeUntil) return { status: "active", remainingMs: state.activeUntil - now };
  if (now < state.readyAt) return { status: "cooldown", remainingMs: state.readyAt - now };
  return { status: "ready", remainingMs: 0 };
}
