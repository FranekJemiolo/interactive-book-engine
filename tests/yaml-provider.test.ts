import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YAMLProvider } from '../src/adapters/yaml-provider';
import { Book, Chapter, Node } from '../src/types';

// Mock fetch
global.fetch = vi.fn();

describe('YAMLProvider', () => {
  let provider: YAMLProvider;

  beforeEach(() => {
    provider = new YAMLProvider('');
    vi.clearAllMocks();
  });

  describe('loadBook', () => {
    it('should load and parse book.yaml', async () => {
      const mockBookYaml = `
title: "Test Book"
chapters:
  - chapter_1
  - chapter_2
arcs:
  calm_intro:
    pacing:
      frameDelay: 600
      suspense: "low"
    visuals:
      tone: "subtle unease"
`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockBookYaml)
      });

      const book = await provider.loadBook();

      expect(book.title).toBe('Test Book');
      expect(book.chapters).toEqual(['chapter_1', 'chapter_2']);
      expect(book.arcs).toHaveProperty('calm_intro');
    });

    it('should cache the loaded book', async () => {
      const mockBookYaml = `
title: "Test Book"
chapters:
  - chapter_1
arcs: {}
`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockBookYaml)
      });

      await provider.loadBook();
      await provider.loadBook();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error if fetch fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(provider.loadBook()).rejects.toThrow('Failed to load book');
    });
  });

  describe('getChapter', () => {
    it('should load and parse chapter.yaml', async () => {
      const mockChapterYaml = `
id: chapter_1
title: "Chapter 1"
arc: calm_intro
nodes:
  - node_1
  - node_2
context:
  setting: "test"
`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockChapterYaml)
      });

      const chapter = await provider.getChapter('chapter_1');

      expect(chapter.id).toBe('chapter_1');
      expect(chapter.title).toBe('Chapter 1');
      expect(chapter.arc).toBe('calm_intro');
      expect(chapter.nodes).toEqual(['node_1', 'node_2']);
      expect(chapter.context).toEqual({ setting: 'test' });
    });

    it('should cache the loaded chapter', async () => {
      const mockChapterYaml = `
id: chapter_1
title: "Chapter 1"
arc: calm_intro
nodes:
  - node_1
context: {}
`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockChapterYaml)
      });

      await provider.getChapter('chapter_1');
      await provider.getChapter('chapter_1');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNode', () => {
    it('should load and parse node.yaml', async () => {
      const mockNodeYaml = `
id: node_1
content:
  - type: text
    value: "Test content"
  - type: pause
    duration: 500
choices:
  - text: "Choice 1"
    goto: node_2
`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockNodeYaml)
      });

      const node = await provider.getNode('node_1');

      expect(node.id).toBe('node_1');
      expect(node.content).toHaveLength(2);
      expect(node.content[0].type).toBe('text');
      expect((node.content[0] as any).value).toBe('Test content');
      expect(node.content[1].type).toBe('pause');
      expect(node.choices).toHaveLength(1);
      expect(node.choices?.[0].text).toBe('Choice 1');
    });

    it('should cache the loaded node', async () => {
      const mockNodeYaml = `
id: node_1
content:
  - type: text
    value: "Test content"
choices: []
`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockNodeYaml)
      });

      await provider.getNode('node_1');
      await provider.getNode('node_1');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearCache', () => {
    it('should clear all caches', async () => {
      const mockBookYaml = 'title: "Test"\nchapters: []\narcs: {}';
      const mockChapterYaml = 'id: chapter_1\ntitle: "Chapter 1"\narc: calm_intro\nnodes: []\ncontext: {}';
      const mockNodeYaml = 'id: node_1\ncontent: []\nchoices: []';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockBookYaml)
      });
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockChapterYaml)
      });
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockNodeYaml)
      });

      await provider.loadBook();
      await provider.getChapter('chapter_1');
      await provider.getNode('node_1');

      provider.clearCache();

      // Set up mocks again for the second load
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockBookYaml)
      });
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockChapterYaml)
      });
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockNodeYaml)
      });

      await provider.loadBook();
      await provider.getChapter('chapter_1');
      await provider.getNode('node_1');

      expect(global.fetch).toHaveBeenCalledTimes(6);
    });
  });
});
