import { applyKey, releaseAll, type InputState } from "./inputState";

export function attachKeyboard(target: Window, state: InputState): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    if (applyKey(state, event.code, true)) event.preventDefault();
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (applyKey(state, event.code, false)) event.preventDefault();
  };
  // Without this, a key held while the tab loses focus stays "pressed" forever.
  const onBlur = () => releaseAll(state);

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  target.addEventListener("blur", onBlur);

  return () => {
    target.removeEventListener("keydown", onKeyDown);
    target.removeEventListener("keyup", onKeyUp);
    target.removeEventListener("blur", onBlur);
    releaseAll(state);
  };
}
