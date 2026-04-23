import { Book, Chapter, Node, BookProvider } from "../types";

export class DBProvider implements BookProvider {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  async loadBook(): Promise<Book> {
    const response = await fetch(`${this.baseUrl}/books/test-book`);
    if (!response.ok) {
      throw new Error(`Failed to load book: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }

  async getNode(id: string): Promise<Node> {
    const response = await fetch(`${this.baseUrl}/nodes/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to load node ${id}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }

  async getChapter(id: string): Promise<Chapter> {
    const response = await fetch(`${this.baseUrl}/chapters/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to load chapter ${id}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }
}
