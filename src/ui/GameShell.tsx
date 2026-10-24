"use client";

import { useEffect, useRef, useState } from "react";
import { createGameBus, type GameStateEvent } from "@/src/game/events";

export default function GameShell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<GameStateEvent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const bus = createGameBus();
    const offState = bus.on("game:state", setStatus);
    let game: { destroy(removeCanvas: boolean): void } | null = null;
    let cancelled = false;

    // Phaser touches `window` at import time, so it is loaded only in the browser.
    import("@/src/game/createGame")
      .then(({ createGame }) => {
        if (!cancelled) game = createGame(parent, bus);
      })
      .catch((error: unknown) => {
        console.error("Failed to load the game", error);
        setLoadError("The game failed to load. Reload the page to try again.");
      });

    // React StrictMode mounts twice in development; destroying here keeps exactly one canvas.
    return () => {
      cancelled = true;
      offState();
      game?.destroy(true);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="game-container" data-testid="game-container" />
      {loadError && (
        <p className="load-error" role="alert">
          {loadError}
        </p>
      )}
      <p className="sr-only" data-testid="game-status">
        {status
          ? `Wave ${status.wave}. Score ${status.score}. Health ${status.hp} of ${status.maxHp}.`
          : "Game not started."}
      </p>
    </>
  );
}
