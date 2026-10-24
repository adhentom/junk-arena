export type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  ability: boolean;
};

type InputAction = keyof InputState;

export const KEY_BINDINGS: Readonly<Record<string, InputAction>> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "fire",
  KeyE: "ability",
  ShiftLeft: "ability",
  ShiftRight: "ability",
};

export function createInputState(): InputState {
  return { up: false, down: false, left: false, right: false, fire: false, ability: false };
}

/** Returns true when the key is bound to a game action. */
export function applyKey(state: InputState, code: string, isDown: boolean): boolean {
  const action = KEY_BINDINGS[code];
  if (!action) return false;
  state[action] = isDown;
  return true;
}

export function releaseAll(state: InputState): void {
  state.up = state.down = state.left = state.right = state.fire = state.ability = false;
}

export function movementVector(state: InputState): { x: number; y: number } {
  const x = Number(state.right) - Number(state.left);
  const y = Number(state.down) - Number(state.up);
  const length = Math.hypot(x, y);
  return length === 0 ? { x: 0, y: 0 } : { x: x / length, y: y / length };
}
