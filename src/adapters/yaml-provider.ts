import yaml from "js-yaml";
import { Book, Chapter, Node, BookProvider } from "../types";
import { getBasePath } from "../utils/base-path";

export class YAMLProvider implements BookProvider {
  private bookCache: Book | null = null;
  private nodeCache: Map<string, Node> = new Map();
  private chapterCache: Map<string, Chapter> = new Map();

  constructor(private basePath: string = getBasePath()) {}

  async loadBook(): Promise<Book> {
    if (this.bookCache) {
      console.log('[YAMLProvider] Returning cached book');
      return this.bookCache;
    }

    try {
      console.log('[YAMLProvider] Loading book from:', `${this.basePath}/book.yaml`);
      const response = await fetch(`${this.basePath}/book.yaml`);
      console.log('[YAMLProvider] Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to load book: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('[YAMLProvider] Book YAML loaded, length:', text.length);
      const data = yaml.load(text) as any;
      console.log('[YAMLProvider] Book parsed:', data);

      this.bookCache = this.parseBook(data);
      console.log('[YAMLProvider] Book cached');
      return this.bookCache;
    } catch (error) {
      console.error("[YAMLProvider] Error loading book:", error);
      throw error;
    }
  }

  async getNode(id: string): Promise<Node> {
    if (this.nodeCache.has(id)) {
      console.log('[YAMLProvider] Returning cached node:', id);
      return this.nodeCache.get(id)!;
    }

    try {
      console.log('[YAMLProvider] Loading node from:', `${this.basePath}/nodes/${id}.yaml`);
      const response = await fetch(`${this.basePath}/nodes/${id}.yaml`);
      console.log('[YAMLProvider] Node response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to load node ${id}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('[YAMLProvider] Node YAML loaded, length:', text.length);
      const data = yaml.load(text) as any;
      console.log('[YAMLProvider] Node parsed:', data);

      const node = this.parseNode(data);
      this.nodeCache.set(id, node);
      console.log('[YAMLProvider] Node cached');
      return node;
    } catch (error) {
      console.error("[YAMLProvider] Error loading node:", error);
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
