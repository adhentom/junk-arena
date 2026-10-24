export type GameStateEvent = {
  score: number;
  wave: number;
  hp: number;
  maxHp: number;
  multiplier: number;
};

export type GameOverEvent = {
  score: number;
  wave: number;
};

type EventMap = {
  "game:state": GameStateEvent;
  "game:over": GameOverEvent;
};

type Listener<K extends keyof EventMap> = (payload: EventMap[K]) => void;

export type GameBus = {
  on<K extends keyof EventMap>(type: K, listener: Listener<K>): () => void;
  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void;
};

// Low-frequency channel between Phaser scenes and the React shell. Per-frame data never goes through here.
export function createGameBus(): GameBus {
  const listeners = new Map<keyof EventMap, Set<(payload: never) => void>>();

  return {
    on(type, listener) {
      const set = listeners.get(type) ?? new Set();
      listeners.set(type, set);
      set.add(listener);
      return () => set.delete(listener);
    },
    emit(type, payload) {
      listeners.get(type)?.forEach((listener) => (listener as Listener<typeof type>)(payload));
    },
  };
}
