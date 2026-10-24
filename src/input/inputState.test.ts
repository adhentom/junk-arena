import { describe, expect, it } from "vitest";
import { applyKey, createInputState, movementVector, releaseAll } from "./inputState";

describe("inputState", () => {
  it("maps WASD and arrow keys to actions", () => {
    const state = createInputState();
    expect(applyKey(state, "KeyW", true)).toBe(true);
    expect(applyKey(state, "ArrowRight", true)).toBe(true);
    expect(applyKey(state, "Space", true)).toBe(true);
    expect(state).toMatchObject({ up: true, right: true, fire: true });
    applyKey(state, "KeyW", false);
    expect(state.up).toBe(false);
  });

  it("maps E and both Shift keys to the ability action", () => {
    for (const code of ["KeyE", "ShiftLeft", "ShiftRight"]) {
      const state = createInputState();
      expect(applyKey(state, code, true)).toBe(true);
      expect(state.ability).toBe(true);
    }
  });

  it("ignores unbound keys", () => {
    const state = createInputState();
    expect(applyKey(state, "KeyZ", true)).toBe(false);
    expect(state).toEqual(createInputState());
  });

  it("normalises diagonal movement", () => {
    const state = createInputState();
    applyKey(state, "KeyD", true);
    applyKey(state, "KeyS", true);
    const move = movementVector(state);
    expect(Math.hypot(move.x, move.y)).toBeCloseTo(1);
    expect(move.x).toBeCloseTo(Math.SQRT1_2);
    expect(move.y).toBeCloseTo(Math.SQRT1_2);
  });

  it("cancels opposite directions and releases everything", () => {
    const state = createInputState();
    applyKey(state, "KeyA", true);
    applyKey(state, "KeyD", true);
    expect(movementVector(state)).toEqual({ x: 0, y: 0 });
    releaseAll(state);
    expect(state).toEqual(createInputState());
  });
});
