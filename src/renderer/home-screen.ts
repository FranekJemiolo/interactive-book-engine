import { Book, Progress, Chapter } from "../types";
import { BookProvider } from "../types";

export class HomeScreen {
  private container: HTMLElement;
  private onStartChapter?: (chapterId: string) => void;
  private onResume?: () => void;
  private bookProvider?: BookProvider;
  private loadedChapters: Map<string, Chapter> = new Map();

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  setBookProvider(provider: BookProvider): void {
    this.bookProvider = provider;
  }

  async render(book: Book, progress: Progress | null): Promise<void> {
    // Load all chapter data
    const chapterData: Chapter[] = [];
    for (const chapterId of book.chapters) {
      if (typeof chapterId === 'string') {
        try {
          const chapter = await this.bookProvider!.getChapter(chapterId);
          this.loadedChapters.set(chapterId, chapter);
          chapterData.push(chapter);
        } catch (error) {
          console.error(`Failed to load chapter ${chapterId}:`, error);
        }
      } else {
        chapterData.push(chapterId);
      }
    }

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
            ${chapterData.map(chapter => this.renderChapterCard(chapter, progress)).join('')}
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
    chapterData.forEach(chapter => {
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
    const totalNodes = chapter.nodes?.length || 0;
    const isCompleted = visitedCount === totalNodes && totalNodes > 0;
    const isInProgress = visitedCount > 0 && !isCompleted;

    return `
      <div class="chapter-card" id="chapter-${chapter.id}">
        <div class="chapter-info">
          <h3>${chapter.title || chapter.id}</h3>
          <span class="chapter-arc">${chapter.arc || ''}</span>
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
