export const ARENA = { width: 1280, height: 720 } as const;

export const SCENES = {
  boot: "Boot",
  menu: "Menu",
  arena: "Arena",
  hud: "Hud",
  gameOver: "GameOver",
} as const;

export const TEXTURES = {
  player: "player",
  rustling: "rustling",
  bullet: "bullet",
  spark: "spark",
} as const;

export const COLORS = {
  background: 0x07070d,
  grid: 0x16162a,
  player: 0x00f0ff,
  rustling: 0xff7a1a,
  bullet: 0xfff35c,
  accent: 0xff2bd6,
  danger: 0xff3b5c,
} as const;

export const FONT = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
