import { Progress } from "../types";

const STORAGE_KEY = "inbe-progress";

export class ProgressManager {
  saveProgress(progress: Progress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }

  loadProgress(): Progress | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to load progress:", e);
      return null;
    }
  }

  clearProgress(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear progress:", e);
    }
  }

  updateChapterProgress(
    chapterId: string,
    visitedNodes: string[]
  ): Progress {
    const progress = this.loadProgress() || this.createEmptyProgress();

    progress.chapters[chapterId] = {
      visitedNodes,
    };

    progress.lastChapter = chapterId;
    progress.lastNode = visitedNodes[visitedNodes.length - 1];

    this.saveProgress(progress);
    return progress;
  }

  updateLastPosition(chapterId: string, nodeId: string): Progress {
    const progress = this.loadProgress() || this.createEmptyProgress();

    progress.lastChapter = chapterId;
    progress.lastNode = nodeId;

    this.saveProgress(progress);
    return progress;
  }

  private createEmptyProgress(): Progress {
    return {
      chapters: {},
      lastChapter: "",
      lastNode: "",
    };
  }
}
