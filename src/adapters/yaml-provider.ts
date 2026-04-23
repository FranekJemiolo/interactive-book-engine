import yaml from "js-yaml";
import { Book, Chapter, Node, BookProvider } from "../types";

export class YAMLProvider implements BookProvider {
  private bookCache: Book | null = null;
  private nodeCache: Map<string, Node> = new Map();
  private chapterCache: Map<string, Chapter> = new Map();

  constructor(private basePath: string = "/content") {}

  async loadBook(): Promise<Book> {
    if (this.bookCache) {
      return this.bookCache;
    }

    try {
      const response = await fetch(`${this.basePath}/book.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to load book: ${response.statusText}`);
      }

      const text = await response.text();
      const data = yaml.load(text) as any;

      this.bookCache = this.parseBook(data);
      return this.bookCache;
    } catch (error) {
      console.error("Error loading book:", error);
      throw error;
    }
  }

  async getNode(id: string): Promise<Node> {
    if (this.nodeCache.has(id)) {
      return this.nodeCache.get(id)!;
    }

    try {
      const response = await fetch(`${this.basePath}/nodes/${id}.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to load node ${id}: ${response.statusText}`);
      }

      const text = await response.text();
      const data = yaml.load(text) as any;

      const node = this.parseNode(data);
      this.nodeCache.set(id, node);
      return node;
    } catch (error) {
      console.error(`Error loading node ${id}:`, error);
      throw error;
    }
  }

  async getChapter(id: string): Promise<Chapter> {
    if (this.chapterCache.has(id)) {
      return this.chapterCache.get(id)!;
    }

    try {
      const response = await fetch(`${this.basePath}/chapters/${id}.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to load chapter ${id}: ${response.statusText}`);
      }

      const text = await response.text();
      const data = yaml.load(text) as any;

      const chapter = this.parseChapter(data);
      this.chapterCache.set(id, chapter);
      return chapter;
    } catch (error) {
      console.error(`Error loading chapter ${id}:`, error);
      throw error;
    }
  }

  private parseBook(data: any): Book {
    return {
      title: data.title,
      chapters: data.chapters || [],
      arcs: data.arcs || {},
    };
  }

  private parseChapter(data: any): Chapter {
    return {
      id: data.id,
      title: data.title,
      arc: data.arc,
      nodes: data.nodes || [],
      context: data.context || {},
    };
  }

  private parseNode(data: any): Node {
    return {
      id: data.id,
      content: data.content || [],
      choices: data.choices || [],
      auto: data.auto || [],
      pacing: data.pacing,
    };
  }

  clearCache(): void {
    this.bookCache = null;
    this.nodeCache.clear();
    this.chapterCache.clear();
  }
}
