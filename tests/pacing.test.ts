import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PacingSystem } from "../src/engine/pacing-system";
import { Arc } from "../src/types";

describe("PacingSystem", () => {
  let pacingSystem: PacingSystem;
  let arcPacing: Arc;

  beforeEach(() => {
    vi.useFakeTimers();
    arcPacing = {
      pacing: {
        frameDelay: 500,
        suspense: "medium",
      },
    };
    pacingSystem = new PacingSystem(arcPacing);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should apply intro delay", async () => {
    pacingSystem.setPacing({ introDelay: 1000 });
    const promise = pacingSystem.applyIntroDelay();
    vi.advanceTimersByTime(1000);
    await promise;
  });

  it("should apply frame delay", async () => {
    const promise = pacingSystem.applyFrameDelay();
    vi.advanceTimersByTime(500);
    await promise;
  });

  it("should apply suspense pause", async () => {
    const promise = pacingSystem.applySuspensePause();
    vi.advanceTimersByTime(3000); // medium suspense = 3000ms (3 seconds)
    await promise;
  });

  it("should skip delays in fast-forward mode", async () => {
    pacingSystem.setFastForward(true);
    const promise = pacingSystem.applyFrameDelay();
    await promise; // Should resolve immediately
  });

  it("should respect node pacing over arc pacing", async () => {
    pacingSystem.setPacing({ frameDelayMultiplier: 2 });
    const promise = pacingSystem.applyFrameDelay();
    vi.advanceTimersByTime(1000); // 500 * 2 = 1000
    await promise;
  });

  it("should return correct suspense delay based on arc", async () => {
    pacingSystem = new PacingSystem({
      pacing: { suspense: "high" },
    });
    const promise = pacingSystem.applySuspensePause();
    vi.advanceTimersByTime(3000); // high suspense = 3000ms (3 seconds)
    await promise;
  });

  it("should handle no suspense delay", async () => {
    pacingSystem = new PacingSystem({
      pacing: { suspense: "low" },
    });
    const promise = pacingSystem.applySuspensePause();
    vi.advanceTimersByTime(3000); // low suspense = 3000ms (3 seconds)
    await promise;
  });

  it("should track fast-forward state", () => {
    expect(pacingSystem.isFastForward()).toBe(false);
    pacingSystem.setFastForward(true);
    expect(pacingSystem.isFastForward()).toBe(true);
    pacingSystem.setFastForward(false);
    expect(pacingSystem.isFastForward()).toBe(false);
  });

  it("should reset state", () => {
    pacingSystem.setPacing({ introDelay: 1000 });
    pacingSystem.setFastForward(true);
    pacingSystem.reset();
    expect(pacingSystem.isFastForward()).toBe(false);
  });
});
