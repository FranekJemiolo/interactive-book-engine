import { StateStore } from "./state/store";
import { YAMLProvider } from "./adapters/yaml-provider";
import { DOMRenderer } from "./renderer/dom-renderer";
import { HomeScreen } from "./renderer/home-screen";
import { NodeLifecycleEngine, AutoTransitionError } from "./engine/node-lifecycle";
import { ChapterSystem } from "./engine/chapter-system";
import { ProgressManager } from "./utils/progress";
import { ImmersiveMode } from "./engine/immersive-mode";
import { URLStateManager } from "./utils/url-state";
import { createRoot } from "react-dom/client";
import React from "react";
import { ReactBookRenderer } from "./renderer/ReactBookRenderer";
import "./styles.css";

class InteractiveBookApp {
  private stateStore: StateStore;
  private bookProvider: YAMLProvider;
  private renderer: DOMRenderer;
  private homeScreen: HomeScreen;
  private nodeEngine!: NodeLifecycleEngine;
  private chapterSystem: ChapterSystem;
  private progressManager: ProgressManager;
  private immersiveMode: ImmersiveMode;
  private currentBook: any;
  private reactRoot: any;

  constructor() {
    this.stateStore = new StateStore();
    this.bookProvider = new YAMLProvider();
    this.renderer = new DOMRenderer("app");
    this.homeScreen = new HomeScreen("app");
    this.homeScreen.setBookProvider(this.bookProvider);
    this.chapterSystem = new ChapterSystem(this.bookProvider, this.stateStore);
    this.progressManager = new ProgressManager();
    this.immersiveMode = new ImmersiveMode("app");

    this.setupNodeEngine();
    this.setupRenderer();
    this.setupImmersiveToggle();
    this.setupHomeScreen();
    this.setupShareHandler();
    this.setupReactRenderer();
  }

  private setupNodeEngine(): void {
    this.nodeEngine = new NodeLifecycleEngine(
      this.stateStore,
      (phase) => console.log("Phase:", phase),
      (frame) => this.renderer.renderFrame(frame),
      (choices) => this.renderer.renderChoices(choices),
      undefined // arc pacing will be set when chapter loads
    );
  }

  private setupRenderer(): void {
    this.renderer.setChoiceHandler(async (choiceId) => {
      this.handleChoice(choiceId);
    });
  }

  private setupImmersiveToggle(): void {
    const button = document.createElement("button");
    button.className = "immersive-toggle";
    button.textContent = "📖 Immersive";
    button.onclick = () => {
      this.immersiveMode.toggle();
      button.textContent = this.immersiveMode.isEnabled()
        ? "✕ Exit Immersive"
        : "📖 Immersive";
    };
    document.body.appendChild(button);
  }

  private setupHomeScreen(): void {
    this.homeScreen.setStartChapterHandler(async (chapterId: string) => {
      this.homeScreen.hide();
      await this.loadChapter(chapterId, this.currentBook);
      await this.startChapter();
    });

    this.homeScreen.setResumeHandler(async () => {
      const progress = this.progressManager.loadProgress();
      if (progress && progress.lastChapter) {
        this.homeScreen.hide();
        await this.loadChapter(progress.lastChapter, this.currentBook);
        if (progress.lastNode) {
          await this.navigateToNode(progress.lastNode);
        }
      }
    });
  }

  private setupShareHandler(): void {
    this.renderer.setShareHandler(() => {
      const state = this.stateStore.getState();
      const shareableURL = URLStateManager.getShareableURL(state);
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableURL).then(() => {
        alert('URL copied to clipboard!');
      }).catch((err) => {
        console.error('Failed to copy URL:', err);
        // Fallback: show URL in alert
        alert(`Shareable URL: ${shareableURL}`);
      });
    });
  }

  private setupReactRenderer(): void {
    console.log('[App] setupReactRenderer called');
    const container = document.getElementById('app');
    if (!container) {
      console.error('[App] App container not found');
      return;
    }
    console.log('[App] Container found:', container);
    console.log('[App] Container innerHTML before:', container.innerHTML);
    console.log('[App] Container style:', window.getComputedStyle(container).cssText);

    // Unmount existing React root if it exists
    if (this.reactRoot) {
      console.log('[App] Unmounting existing React root');
      this.reactRoot.unmount();
    }

    this.reactRoot = createRoot(container);
    console.log('[App] React root created, rendering ReactBookRenderer');
    
    this.reactRoot.render(
      React.createElement(ReactBookRenderer, {
        onChoiceSelect: (choiceId: string) => {
          console.log('[App] React onChoiceSelect called:', choiceId);
          this.handleChoice(choiceId);
        },
        onShare: () => {
          console.log('[App] React onShare called');
          const state = this.stateStore.getState();
          const shareableURL = URLStateManager.getShareableURL(state);
          navigator.clipboard.writeText(shareableURL).then(() => {
            alert('URL copied to clipboard!');
          }).catch((err) => {
            console.error('Failed to copy URL:', err);
            alert(`Shareable URL: ${shareableURL}`);
          });
        },
        onBack: () => {
          console.log('[App] React onBack called');
          this.returnToHome();
        },
        chapters: this.currentBook?.chapters || [],
        currentChapterId: this.chapterSystem.getCurrentChapter()?.id
      })
    );
    console.log('[App] ReactBookRenderer rendered');
    
    setTimeout(() => {
      console.log('[App] Container innerHTML after render:', container.innerHTML);
    }, 1000);
  }

  private handleChoice(choiceId: string): void {
    this.nodeEngine.makeChoice(choiceId).then((goto) => {
      this.navigateToNode(goto);
    }).catch((error) => {
      console.error("Error handling choice:", error);
    });
  }

  private returnToHome(): void {
    console.log('[App] returnToHome called');
    // Reload the page to return to initial state (shows first chapter)
    window.location.href = window.location.pathname + window.location.search;
  }

  async start(): Promise<void> {
    try {
      // Use React renderer API for loading
      const rendererAPI = (window as any).rendererAPI;
      if (rendererAPI) {
        rendererAPI.setLoading(true);
      } else {
        this.renderer.setLoading(true);
      }

      // Load book
      const book = await this.bookProvider.loadBook();
      this.currentBook = book;
      console.log("Book loaded:", book.title);

      // Check for URL state first, then fall back to localStorage progress
      const urlState = URLStateManager.loadStateFromURL();
      let progress = null;

      if (urlState) {
        // Load state from URL
        this.stateStore.deserialize(JSON.stringify(urlState));
        progress = {
          lastChapter: urlState.chapter.id || "",
          lastNode: "",
          chapters: {
            [urlState.chapter.id]: {
              visitedNodes: urlState.meta.visitedNodes
            }
          }
        };
        console.log("Loaded state from URL");
      } else {
        // Check for saved progress from localStorage
        progress = this.progressManager.loadProgress();
      }

      // Show home screen
      if (rendererAPI) {
        rendererAPI.setLoading(false);
      } else {
        this.renderer.setLoading(false);
      }
      
      // Load the first chapter directly if no URL state
      if (!urlState && book.chapters.length > 0) {
        const firstChapterId = typeof book.chapters[0] === 'string' ? book.chapters[0] : book.chapters[0].id;
        await this.loadChapter(firstChapterId, book);
        await this.startChapter();
      }
    } catch (error) {
      console.error("Error starting app:", error);
      const rendererAPI = (window as any).rendererAPI;
      if (rendererAPI) {
        rendererAPI.showError("Failed to load book");
        rendererAPI.setLoading(false);
      } else {
        this.renderer.showError("Failed to load book");
        this.renderer.setLoading(false);
      }
    }
  }

  private async loadChapter(chapterId: string, book: any): Promise<void> {
    try {
      const chapter = await this.chapterSystem.loadChapter(chapterId);
      
      // Use React renderer API for chapter title
      const rendererAPI = (window as any).rendererAPI;
      if (rendererAPI) {
        rendererAPI.showChapterTitle(chapter);
      } else {
        this.renderer.showChapterTitle(chapter);
      }

      // Get arc pacing for this chapter
      const arc = book.arcs[chapter.arc];
      this.setupNodeEngineWithArc(arc);
    } catch (error) {
      console.error("Error loading chapter:", error);
      throw error;
    }
  }

  private setupNodeEngineWithArc(arc: any): void {
    console.log('[App] setupNodeEngineWithArc called with arc:', arc);
    this.nodeEngine = new NodeLifecycleEngine(
      this.stateStore,
      (phase) => console.log('[App] Phase:', phase),
      (frame) => {
        console.log('[App] Frame callback called:', frame);
        // Use React renderer API
        const rendererAPI = (window as any).rendererAPI;
        console.log('[App] rendererAPI available in frame callback:', !!rendererAPI);
        if (rendererAPI) {
          console.log('[App] Calling rendererAPI.addFrame()');
          rendererAPI.addFrame(frame);
        } else {
          console.log('[App] Using vanilla renderer.renderFrame()');
          this.renderer.renderFrame(frame);
        }
      },
      (choices) => {
        console.log('[App] Choices callback called:', choices);
        // Use React renderer API
        const rendererAPI = (window as any).rendererAPI;
        console.log('[App] rendererAPI available in choices callback:', !!rendererAPI);
        if (rendererAPI) {
          console.log('[App] Calling rendererAPI.setChoices()');
          rendererAPI.setChoices(choices);
        } else {
          console.log('[App] Using vanilla renderer.renderChoices()');
          this.renderer.renderChoices(choices);
        }
      },
      arc
    );
    console.log('[App] NodeLifecycleEngine created');
  }

  private async startChapter(): Promise<void> {
    const nodeId = this.chapterSystem.getCurrentNodeId();
    if (nodeId) {
      await this.navigateToNode(nodeId);
    }
  }

  private async navigateToNode(nodeId: string): Promise<void> {
    console.log('[App] navigateToNode called:', nodeId);
    try {
      // Clear content using React renderer API
      const rendererAPI = (window as any).rendererAPI;
      console.log('[App] rendererAPI available:', !!rendererAPI);
      if (rendererAPI) {
        console.log('[App] Calling rendererAPI.clearContent()');
        rendererAPI.clearContent();
      } else {
        console.log('[App] Using vanilla renderer.clearContent()');
        this.renderer.clearContent();
      }

      const node = await this.bookProvider.getNode(nodeId);
      console.log('[App] Node loaded:', node.id);
      await this.nodeEngine.executeNode(node);
      console.log('[App] Node executed');

      // Update progress
      const state = this.stateStore.getState();
      this.progressManager.updateLastPosition(
        this.chapterSystem.getCurrentChapter()!.id,
        nodeId
      );
      this.progressManager.updateChapterProgress(
        this.chapterSystem.getCurrentChapter()!.id,
        state.meta.visitedNodes
      );

      // Save state to URL
      URLStateManager.saveStateToURL(state);
      console.log('[App] State saved to URL');
    } catch (error) {
      if (error instanceof AutoTransitionError) {
        console.log('[App] AutoTransition to:', error.goto);
        // Auto-transition to next node
        await this.navigateToNode(error.goto);
      } else {
        console.error("[App] Error navigating to node:", error);
        this.renderer.showError("Failed to load scene");
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new InteractiveBookApp();
  app.start();
});
