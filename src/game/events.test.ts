import { describe, expect, it, vi } from "vitest";
import { createGameBus } from "./events";

describe("createGameBus", () => {
  it("delivers events to subscribers until they unsubscribe", () => {
    const bus = createGameBus();
    const listener = vi.fn();
    const off = bus.on("game:over", listener);

    bus.emit("game:over", { score: 120, wave: 3 });
    off();
    bus.emit("game:over", { score: 0, wave: 1 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ score: 120, wave: 3 });
  });
});
