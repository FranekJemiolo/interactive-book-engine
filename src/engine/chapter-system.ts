import { Chapter, BookProvider } from "../types";
import { StateStore } from "../state/store";

export class ChapterSystem {
  private currentChapter: Chapter | null = null;
  private currentNodeIndex: number = 0;

  constructor(
    private bookProvider: BookProvider,
    private stateStore: StateStore
  ) {}

  async loadChapter(chapterId: string): Promise<Chapter> {
    const chapter = await this.bookProvider.getChapter(chapterId);
    this.currentChapter = chapter;
    this.currentNodeIndex = 0;

    // Update state with chapter context
    this.stateStore.setChapter(chapter.id, chapter.context);

    return chapter;
  }

  getCurrentChapter(): Chapter | null {
    return this.currentChapter;
  }

  getCurrentNodeId(): string | null {
    if (!this.currentChapter) return null;
    return this.currentChapter.nodes[this.currentNodeIndex];
  }

  advanceToNextNode(): string | null {
    if (!this.currentChapter) return null;

    this.currentNodeIndex++;
    if (this.currentNodeIndex >= this.currentChapter.nodes.length) {
      return null; // Chapter complete
    }

    return this.currentChapter.nodes[this.currentNodeIndex];
  }

  isChapterComplete(): boolean {
    if (!this.currentChapter) return false;
    return this.currentNodeIndex >= this.currentChapter.nodes.length - 1;
  }

  getNodeIndex(nodeId: string): number {
    if (!this.currentChapter) return -1;
    return this.currentChapter.nodes.indexOf(nodeId);
  }

  jumpToNode(nodeId: string): boolean {
    if (!this.currentChapter) return false;

    const index = this.getNodeIndex(nodeId);
    if (index === -1) return false;

    this.currentNodeIndex = index;
    return true;
  }

  getChapterProgress(): { visited: number; total: number } {
    if (!this.currentChapter) return { visited: 0, total: 0 };

    const state = this.stateStore.getState();
    const visited = this.currentChapter.nodes.filter((nodeId) =>
      state.meta.visitedNodes.includes(nodeId)
    ).length;

    return {
      visited,
      total: this.currentChapter.nodes.length,
    };
  }

  reset(): void {
    this.currentChapter = null;
    this.currentNodeIndex = 0;
  }
}
