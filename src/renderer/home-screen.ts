import { Book, Chapter, Progress } from "../types";

export class HomeScreen {
  private container: HTMLElement;
  private onStartChapter?: (chapterId: string) => void;
  private onResume?: () => void;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  render(book: Book, progress: Progress | null): void {
    this.container.innerHTML = `
      <div class="home-screen">
        <h1 class="book-title">${book.title}</h1>
        
        ${progress && progress.lastChapter ? `
          <div class="continue-section">
            <button class="continue-button" id="resume-button">
              ▶ Continue Reading
            </button>
            <p class="continue-info">Last read: Chapter ${progress.lastChapter}</p>
          </div>
        ` : ''}

        <div class="chapters-section">
          <h2>Chapters</h2>
          <div class="chapters-list">
            ${book.chapters.map(chapter => this.renderChapterCard(chapter, progress)).join('')}
          </div>
        </div>
      </div>
    `;

    // Attach event listeners
    const resumeButton = document.getElementById("resume-button");
    if (resumeButton) {
      resumeButton.addEventListener("click", () => {
        this.onResume?.();
      });
    }

    // Attach chapter click handlers
    book.chapters.forEach(chapter => {
      const card = document.getElementById(`chapter-${chapter.id}`);
      if (card) {
        card.addEventListener("click", () => {
          this.onStartChapter?.(chapter.id);
        });
      }
    });
  }

  private renderChapterCard(chapter: Chapter, progress: Progress | null): string {
    const chapterProgress = progress?.chapters[chapter.id];
    const visitedCount = chapterProgress?.visitedNodes?.length || 0;
    const totalNodes = chapter.nodes.length;
    const isCompleted = visitedCount === totalNodes;
    const isInProgress = visitedCount > 0 && !isCompleted;

    return `
      <div class="chapter-card" id="chapter-${chapter.id}">
        <div class="chapter-info">
          <h3>${chapter.title}</h3>
          <span class="chapter-arc">${chapter.arc}</span>
        </div>
        <div class="chapter-progress">
          ${isCompleted 
            ? '<span class="progress-badge completed">✓ Complete</span>'
            : isInProgress
            ? `<span class="progress-badge in-progress">${visitedCount}/${totalNodes}</span>`
            : '<span class="progress-badge not-started">Not started</span>'
          }
        </div>
      </div>
    `;
  }

  hide(): void {
    this.container.innerHTML = "";
  }

  setStartChapterHandler(handler: (chapterId: string) => void): void {
    this.onStartChapter = handler;
  }

  setResumeHandler(handler: () => void): void {
    this.onResume = handler;
  }
}
