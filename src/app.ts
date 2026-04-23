import { StateStore } from "./state/store";
import { YAMLProvider } from "./adapters/yaml-provider";
import { DOMRenderer } from "./renderer/dom-renderer";
import { NodeLifecycleEngine, AutoTransitionError } from "./engine/node-lifecycle";
import { ChapterSystem } from "./engine/chapter-system";
import { ProgressManager } from "./utils/progress";

class InteractiveBookApp {
  private stateStore: StateStore;
  private bookProvider: YAMLProvider;
  private renderer: DOMRenderer;
  private nodeEngine!: NodeLifecycleEngine;
  private chapterSystem: ChapterSystem;
  private progressManager: ProgressManager;

  constructor() {
    this.stateStore = new StateStore();
    this.bookProvider = new YAMLProvider();
    this.renderer = new DOMRenderer("app");
    this.chapterSystem = new ChapterSystem(this.bookProvider, this.stateStore);
    this.progressManager = new ProgressManager();

    this.setupNodeEngine();
    this.setupRenderer();
  }

  private setupNodeEngine(): void {
    this.nodeEngine = new NodeLifecycleEngine(
      this.stateStore,
      (phase) => console.log("Phase:", phase),
      (frame) => this.renderer.renderFrame(frame),
      (choices) => this.renderer.renderChoices(choices)
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

  async start(): Promise<void> {
    try {
      this.renderer.setLoading(true);

      // Load book
      const book = await this.bookProvider.loadBook();
      console.log("Book loaded:", book.title);

      // Check for saved progress
      const progress = this.progressManager.loadProgress();
      if (progress && progress.lastChapter) {
        console.log("Resuming from:", progress.lastChapter);
        await this.loadChapter(progress.lastChapter);
        // Navigate to last node if available
        if (progress.lastNode) {
          await this.navigateToNode(progress.lastNode);
        }
      } else {
        // Start from first chapter
        await this.loadChapter(book.chapters[0].id);
        await this.startChapter();
      }

      this.renderer.setLoading(false);
    } catch (error) {
      console.error("Error starting app:", error);
      this.renderer.showError("Failed to load book");
      this.renderer.setLoading(false);
    }
  }

  private async loadChapter(chapterId: string): Promise<void> {
    try {
      const chapter = await this.chapterSystem.loadChapter(chapterId);
      this.renderer.showChapterTitle(chapter);
    } catch (error) {
      console.error("Error loading chapter:", error);
      throw error;
    }
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
