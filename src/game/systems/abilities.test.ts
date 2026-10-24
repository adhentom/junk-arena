import { describe, expect, it } from "vitest";
import { ABILITIES, ABILITY_ORDER } from "../abilities/catalog";
import { BALANCE } from "../balance";
import {
  abilityStatus,
  blocksDamage,
  createAbilityState,
  equipAbility,
  isActive,
  tryActivate,
} from "./abilities";

const { shield, gadget } = BALANCE.abilities;

describe("abilities", () => {
  it("starts with a ready shield", () => {
    const state = createAbilityState();
    expect(state.equipped).toBe("shield");
    expect(abilityStatus(state, 0)).toEqual({ status: "ready", remainingMs: 0 });
  });

  it("activates when ready and starts duration and cooldown", () => {
    const { state, result } = tryActivate(createAbilityState("shield"), 1000);
    expect(result).toBe("activated");
    expect(state.activeUntil).toBe(1000 + shield.durationMs);
    expect(state.readyAt).toBe(1000 + shield.cooldownMs);
  });

  it("refuses activation during cooldown and allows it once the cooldown ends", () => {
    const first = tryActivate(createAbilityState("shield"), 0).state;
    const blocked = tryActivate(first, shield.cooldownMs - 1);
    expect(blocked.result).toBe("cooldown");
    expect(blocked.state).toBe(first);
    expect(tryActivate(first, shield.cooldownMs).result).toBe("activated");
  });

  it("expires the shield after its duration", () => {
    const state = tryActivate(createAbilityState("shield"), 0).state;
    expect(isActive(state, shield.durationMs - 1)).toBe(true);
    expect(isActive(state, shield.durationMs)).toBe(false);
    expect(abilityStatus(state, shield.durationMs).status).toBe("cooldown");
    expect(abilityStatus(state, shield.cooldownMs).status).toBe("ready");
  });

  it("blocks damage only while the shield is up", () => {
    const idle = createAbilityState("shield");
    expect(blocksDamage(idle, 0)).toBe(false);
    const up = tryActivate(idle, 0).state;
    expect(blocksDamage(up, 100)).toBe(true);
    expect(blocksDamage(up, shield.durationMs)).toBe(false);
  });

  it("fires the gadget instantly with a cooldown and no damage protection", () => {
    const { state, result } = tryActivate(createAbilityState("gadget"), 500);
    expect(result).toBe("activated");
    expect(isActive(state, 500)).toBe(false);
    expect(blocksDamage(state, 500)).toBe(false);
    expect(abilityStatus(state, 500)).toEqual({ status: "cooldown", remainingMs: gadget.cooldownMs });
    expect(tryActivate(state, 500 + gadget.cooldownMs - 1).result).toBe("cooldown");
  });

  it("equipping selects the ability and resets its cooldown", () => {
    const used = tryActivate(createAbilityState("shield"), 0).state;
    const swapped = equipAbility("gadget");
    expect(swapped).toEqual({ equipped: "gadget", readyAt: 0, activeUntil: 0 });
    expect(abilityStatus(equipAbility(used.equipped), 1).status).toBe("ready");
  });

  it("offers exactly the three defined abilities in order", () => {
    expect(ABILITY_ORDER).toEqual(["shield", "gadget", "scanner"]);
    for (const id of ABILITY_ORDER) expect(ABILITIES[id].id).toBe(id);
  });

  it("keeps the scanner a placeholder that never activates or claims AI output", () => {
    const state = createAbilityState("scanner");
    const attempt = tryActivate(state, 0);
    expect(attempt.result).toBe("unavailable");
    expect(attempt.state).toBe(state);
    expect(abilityStatus(state, 0)).toEqual({ status: "unavailable", remainingMs: 0 });
    expect(blocksDamage(state, 0)).toBe(false);
    expect(ABILITIES.scanner.available).toBe(false);
    expect(ABILITIES.scanner.description).toMatch(/placeholder/i);
    expect(ABILITIES.scanner.description).toMatch(/does nothing/i);
  });
});
