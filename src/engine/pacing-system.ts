import { PacingConfig, Arc } from "../types";

export class PacingSystem {
  private fastForwardMode: boolean = false;
  private currentPacing: PacingConfig | null = null;

  constructor(private arcPacing?: Arc) {}

  setPacing(pacing: PacingConfig | null): void {
    this.currentPacing = pacing;
  }

  async applyIntroDelay(): Promise<void> {
    if (this.fastForwardMode) return;

    const delay = this.getEffectiveDelay("intro");
    // Don't wait at start for intro delay
    if (delay && delay > 0) {
      // Skip intro delay for immediate start
      // await this.delay(delay);
    }
  }

  async applyFrameDelay(frameDelay?: number): Promise<void> {
    if (this.fastForwardMode) return;

    const delay = frameDelay || this.getEffectiveDelay("frame");
    if (delay === Infinity || delay === -1) {
      // Infinite wait - never resolve
      return new Promise(() => {});
    }
    if (delay) {
      await this.delay(delay);
    }
  }

  async applySuspensePause(): Promise<void> {
    if (this.fastForwardMode) return;

    const delay = this.getEffectiveDelay("suspense");
    if (delay) {
      await this.delay(delay);
    }
  }

  setFastForward(enabled: boolean): void {
    this.fastForwardMode = enabled;
  }

  isFastForward(): boolean {
    return this.fastForwardMode;
  }

  getEffectiveDelay(type: "intro" | "frame" | "suspense"): number {
    const arcPacing = this.arcPacing?.pacing;
    const nodePacing = this.currentPacing;

    switch (type) {
      case "intro":
        return nodePacing?.introDelay || arcPacing?.frameDelay || 30000; // Default 30 seconds
      case "frame":
        const baseDelay = arcPacing?.frameDelay || 30000; // Default 30 seconds
        const multiplier = nodePacing?.frameDelayMultiplier || 1;
        return Math.floor(baseDelay * multiplier);
      case "suspense":
        return nodePacing?.suspensePauseBeforeChoices || this.getSuspenseDelay(arcPacing?.suspense) || 30000;
      default:
        return 30000; // Default 30 seconds
    }
  }

  private getSuspenseDelay(suspense?: "low" | "medium" | "high"): number {
    switch (suspense) {
      case "low":
        return 30000; // 30 seconds for auto progression
      case "medium":
        return 30000; // 30 seconds for auto progression
      case "high":
        return 30000; // 30 seconds for auto progression
      default:
        return 30000; // Default to 30 seconds for auto progression
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  reset(): void {
    this.fastForwardMode = false;
    this.currentPacing = null;
  }
}
