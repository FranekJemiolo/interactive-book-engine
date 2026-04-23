import { StateStore } from "./state/store";
import { YAMLProvider } from "./adapters/yaml-provider";
import { DOMRenderer } from "./renderer/dom-renderer";
import { HomeScreen } from "./renderer/home-screen";
import { NodeLifecycleEngine, AutoTransitionError } from "./engine/node-lifecycle";
import { ChapterSystem } from "./engine/chapter-system";
import { ProgressManager } from "./utils/progress";
import { ImmersiveMode } from "./engine/immersive-mode";

class InteractiveBookApp {
  private stateStore: StateStore;
  private bookProvider: YAMLProvider;
  private renderer: DOMRenderer;
  private homeScreen: HomeScreen;
  private nodeEngine!: NodeLifecycleEngine;
  private chapterSystem: ChapterSystem;
  private progressManager: ProgressManager;
  private immersiveMode: ImmersiveMode;
  private currentBook: any = null;

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
      try {
        const nextNodeId = await this.nodeEngine.makeChoice(choiceId);
        await this.navigateToNode(nextNodeId);
      } catch (error) {
        console.error("Error handling choice:", error);
        this.renderer.showError("Failed to process choice");
      }
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

  async start(): Promise<void> {
    try {
      this.renderer.setLoading(true);

      // Load book
      const book = await this.bookProvider.loadBook();
      this.currentBook = book;
      console.log("Book loaded:", book.title);

      // Check for saved progress
      const progress = this.progressManager.loadProgress();

      // Show home screen
      this.renderer.setLoading(false);
      await this.homeScreen.render(book, progress);
    } catch (error) {
      console.error("Error starting app:", error);
      this.renderer.showError("Failed to load book");
      this.renderer.setLoading(false);
    }
  }

  private async loadChapter(chapterId: string, book: any): Promise<void> {
    try {
      const chapter = await this.chapterSystem.loadChapter(chapterId);
      this.renderer.showChapterTitle(chapter);

      // Get arc pacing for this chapter
      const arc = book.arcs[chapter.arc];
      this.setupNodeEngineWithArc(arc);
    } catch (error) {
      console.error("Error loading chapter:", error);
      throw error;
    }
  }

  private setupNodeEngineWithArc(arc: any): void {
    this.nodeEngine = new NodeLifecycleEngine(
      this.stateStore,
      (phase) => console.log("Phase:", phase),
      (frame) => this.renderer.renderFrame(frame),
      (choices) => this.renderer.renderChoices(choices),
      arc
    );
  }

  private async startChapter(): Promise<void> {
    const nodeId = this.chapterSystem.getCurrentNodeId();
    if (nodeId) {
      await this.navigateToNode(nodeId);
    }
  }

  private async navigateToNode(nodeId: string): Promise<void> {
    try {
      this.renderer.clearContent();

      const node = await this.bookProvider.getNode(nodeId);
      await this.nodeEngine.executeNode(node);

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
    } catch (error) {
      if (error instanceof AutoTransitionError) {
        // Auto-transition to next node
        await this.navigateToNode(error.goto);
      } else {
        console.error("Error navigating to node:", error);
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
