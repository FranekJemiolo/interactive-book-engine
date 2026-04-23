export class ImmersiveMode {
  private isImmersive: boolean = false;
  private uiHidden: boolean = false;
  private container: HTMLElement | null = null;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    this.setupEventListeners();
  }

  toggle(): void {
    this.isImmersive = !this.isImmersive;
    this.applyImmersiveMode();
  }

  enable(): void {
    this.isImmersive = true;
    this.applyImmersiveMode();
  }

  disable(): void {
    this.isImmersive = false;
    this.exitImmersiveMode();
  }

  isEnabled(): boolean {
    return this.isImmersive;
  }

  private applyImmersiveMode(): void {
    if (!this.container) return;

    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log("Fullscreen request failed:", err);
      });
    }

    // Hide UI elements
    this.hideUI();

    // Add immersive class to container
    this.container.classList.add("immersive");
  }

  private exitImmersiveMode(): void {
    if (!this.container) return;

    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.log("Fullscreen exit failed:", err);
      });
    }

    // Show UI elements
    this.showUI();

    // Remove immersive class from container
    this.container.classList.remove("immersive");
  }

  private hideUI(): void {
    this.uiHidden = true;
    document.body.classList.add("ui-hidden");
  }

  private showUI(): void {
    this.uiHidden = false;
    document.body.classList.remove("ui-hidden");
  }

  private setupEventListeners(): void {
    // Listen for fullscreen changes
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && this.isImmersive) {
        this.isImmersive = false;
        this.showUI();
        if (this.container) {
          this.container.classList.remove("immersive");
        }
      }
    });

    // Double tap to toggle UI visibility
    let lastTap = 0;
    document.addEventListener("touchend", (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        this.toggleUIVisibility();
        e.preventDefault();
      }
      lastTap = currentTime;
    });

    // Keyboard shortcut to toggle immersive mode (Escape to exit)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isImmersive) {
        this.disable();
      }
      if (e.key === "i" && e.ctrlKey) {
        this.toggle();
      }
    });
  }

  private toggleUIVisibility(): void {
    if (this.uiHidden) {
      this.showUI();
    } else {
      this.hideUI();
    }
  }

  destroy(): void {
    this.disable();
  }
}
