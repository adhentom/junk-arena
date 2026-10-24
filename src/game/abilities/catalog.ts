import { BALANCE } from "../balance";

export type AbilityId = "shield" | "gadget" | "scanner";

export type AbilityDefinition = {
  id: AbilityId;
  name: string;
  description: string;
  cooldownMs: number;
  durationMs: number;
  /** False for placeholders that can be equipped but do nothing yet. */
  available: boolean;
};

const { shield, gadget } = BALANCE.abilities;

export const ABILITIES: Readonly<Record<AbilityId, AbilityDefinition>> = {
  shield: {
    id: "shield",
    name: "SHIELD",
    description: `Blocks all contact damage for ${shield.durationMs / 1000}s. Cooldown ${shield.cooldownMs / 1000}s.`,
    cooldownMs: shield.cooldownMs,
    durationMs: shield.durationMs,
    available: true,
  },
  gadget: {
    id: "gadget",
    name: "SHOCK PULSE",
    description: `Blast nearby junk for ${gadget.damage} damage and knock it back. Cooldown ${gadget.cooldownMs / 1000}s.`,
    cooldownMs: gadget.cooldownMs,
    durationMs: 0,
    available: true,
  },
  scanner: {
    id: "scanner",
    name: "SCANNER",
    description: "Placeholder for AI object scanning, coming in a later phase. Does nothing in this build.",
    cooldownMs: 0,
    durationMs: 0,
    available: false,
  },
};

export const ABILITY_ORDER: readonly AbilityId[] = ["shield", "gadget", "scanner"];
