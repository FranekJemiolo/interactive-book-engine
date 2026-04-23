import { Frame, Choice, Chapter } from "../types";

export class DOMRenderer {
  private container: HTMLElement;
  private contentContainer!: HTMLElement;
  private choicesContainer!: HTMLElement;
  private onChoiceSelect?: (choiceId: string) => void;
  private onShare?: () => void;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.setupContainer();
  }

  private setupContainer(): void {
    this.container.innerHTML = `
      <div class="book-container">
        <div class="content-area" id="content-area"></div>
        <div class="choices-area" id="choices-area"></div>
        <button class="share-button" id="share-button">📤 Share</button>
      </div>
    `;

    this.contentContainer = this.container.querySelector("#content-area")!;
    this.choicesContainer = this.container.querySelector("#choices-area")!;
    
    // Set up share button
    const shareButton = this.container.querySelector("#share-button") as HTMLButtonElement;
    if (shareButton) {
      shareButton.addEventListener("click", () => {
        this.onShare?.();
      });
    }
  }

  setChoiceHandler(handler: (choiceId: string) => void): void {
    this.onChoiceSelect = handler;
  }

  setShareHandler(handler: () => void): void {
    this.onShare = handler;
  }

  renderFrame(frame: Frame): void {
    const element = this.createFrameElement(frame);
    this.contentContainer.appendChild(element);
    this.scrollToBottom();
  }

  private createFrameElement(frame: Frame): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "frame";

    switch (frame.type) {
      case "text":
        wrapper.innerHTML = `<p class="text-frame">${frame.value}</p>`;
        break;
      case "image":
        wrapper.innerHTML = `<img src="${frame.src}" alt="" class="image-frame" />`;
        break;
      case "pause":
        wrapper.className = "pause-frame";
        break;
    }

    return wrapper;
  }

  renderChoices(choices: Choice[]): void {
    this.choicesContainer.innerHTML = "";

    if (choices.length === 0) {
      // Auto-transition case - hide choices
      this.choicesContainer.style.display = "none";
      return;
    }

    this.choicesContainer.style.display = "block";

    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "choice-button";
      button.textContent = choice.text;
      button.onclick = () => {
        this.onChoiceSelect?.(choice.text);
      };

      this.choicesContainer.appendChild(button);
    });
  }

  clearContent(): void {
    this.contentContainer.innerHTML = "";
    this.choicesContainer.innerHTML = "";
  }

  scrollToBottom(): void {
    this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
  }

  showChapterTitle(chapter: Chapter): void {
    const titleElement = document.createElement("h1");
    titleElement.className = "chapter-title";
    titleElement.textContent = chapter.title;
    this.contentContainer.appendChild(titleElement);
    this.scrollToBottom();
  }

  showError(message: string): void {
    this.contentContainer.innerHTML = `
      <div class="error-message">
        <p>Error: ${message}</p>
      </div>
    `;
  }

  setLoading(loading: boolean): void {
    if (loading) {
      this.contentContainer.innerHTML = `
        <div class="loading">
          <p>Loading...</p>
        </div>
      `;
    }
  }
}
