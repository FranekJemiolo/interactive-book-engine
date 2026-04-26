export class ImmersiveMode {
  private isImmersive: boolean = false;
  private uiHidden: boolean = false;
  private container: HTMLElement | null = null;
  private onStateChange?: (isImmersive: boolean) => void;

  constructor(containerId: string, onStateChange?: (isImmersive: boolean) => void) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange;
    this.setupEventListeners();
  }

  toggle(): void {
    this.isImmersive = !this.isImmersive;
    this.applyImmersiveMode();
    this.notifyStateChange();
  }

  enable(): void {
    this.isImmersive = true;
    this.applyImmersiveMode();
    this.notifyStateChange();
  }

  disable(): void {
    this.isImmersive = false;
    this.exitImmersiveMode();
    this.notifyStateChange();
  }

  isEnabled(): boolean {
    return this.isImmersive;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.isImmersive);
    }
  }

  private applyImmersiveMode(): void {
    if (!this.container) return;

    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err: Error) => {
        console.log("Fullscreen request failed:", err);
      });
    } else if ((document.documentElement as any).webkitRequestFullscreen) {
      (document.documentElement as any).webkitRequestFullscreen().catch((err: Error) => {
        console.log("Fullscreen request failed:", err);
      });
    }

    // Hide UI elements
    this.hideUI();

    // Add immersive class to container
    this.container.classList.add("immersive");
  }

  private exitImmersiveMode(): void {
    console.log('[ImmersiveMode] exitImmersiveMode called');
    
    // Show UI elements first
    this.showUI();

    // Remove immersive class from container
    if (this.container) {
      this.container.classList.remove("immersive");
      console.log('[ImmersiveMode] Removed immersive class from container');
    } else {
      console.log('[ImmersiveMode] Container is null, cannot remove immersive class');
    }

    // Exit fullscreen (this might fail if not in fullscreen, which is fine)
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err: Error) => {
          console.log("Fullscreen exit failed:", err);
        });
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen().catch((err: Error) => {
          console.log("Fullscreen exit failed:", err);
        });
      }
    }
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
        this.notifyStateChange();
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
