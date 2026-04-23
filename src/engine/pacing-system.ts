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
    if (delay) {
      await this.delay(delay);
    }
  }

  async applyFrameDelay(frameDelay?: number): Promise<void> {
    if (this.fastForwardMode) return;

    const delay = frameDelay || this.getEffectiveDelay("frame");
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

  private getEffectiveDelay(type: "intro" | "frame" | "suspense"): number {
    const arcPacing = this.arcPacing?.pacing;
    const nodePacing = this.currentPacing;

    switch (type) {
      case "intro":
        return nodePacing?.introDelay || arcPacing?.frameDelay || 0;
      case "frame":
        const baseDelay = arcPacing?.frameDelay || 0;
        const multiplier = nodePacing?.frameDelayMultiplier || 1;
        return Math.floor(baseDelay * multiplier);
      case "suspense":
        return nodePacing?.suspensePauseBeforeChoices || this.getSuspenseDelay(arcPacing?.suspense) || 0;
      default:
        return 0;
    }
  }

  private getSuspenseDelay(suspense?: "low" | "medium" | "high"): number {
    switch (suspense) {
      case "low":
        return 500;
      case "medium":
        return 1000;
      case "high":
        return 2000;
      default:
        return 0;
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
