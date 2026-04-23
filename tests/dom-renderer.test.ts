import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DOMRenderer } from '../src/renderer/dom-renderer';
import { Frame, Choice, Chapter } from '../src/types';

describe('DOMRenderer', () => {
  let renderer: DOMRenderer;
  let container: HTMLElement;

  beforeEach(() => {
    // Create a test container
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    renderer = new DOMRenderer('test-container');
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should throw error if container not found', () => {
      expect(() => new DOMRenderer('non-existent')).toThrow('Container non-existent not found');
    });

    it('should set up container structure', () => {
      const contentArea = container.querySelector('#content-area');
      const choicesArea = container.querySelector('#choices-area');

      expect(contentArea).toBeTruthy();
      expect(choicesArea).toBeTruthy();
    });
  });

  describe('renderFrame', () => {
    it('should render text frame', () => {
      const frame: Frame = { type: 'text', value: 'Test text' };
      renderer.renderFrame(frame);

      const contentArea = container.querySelector('#content-area')!;
      const textFrame = contentArea.querySelector('.text-frame');

      expect(textFrame).toBeTruthy();
      expect(textFrame?.textContent).toBe('Test text');
    });

    it('should render image frame', () => {
      const frame: Frame = { type: 'image', src: '/test.jpg' };
      renderer.renderFrame(frame);

      const contentArea = container.querySelector('#content-area')!;
      const imageFrame = contentArea.querySelector('.image-frame');

      expect(imageFrame).toBeTruthy();
      expect((imageFrame as HTMLImageElement)?.src).toContain('/test.jpg');
    });

    it('should render pause frame', () => {
      const frame: Frame = { type: 'pause', duration: 500 };
      renderer.renderFrame(frame);

      const contentArea = container.querySelector('#content-area')!;
      const pauseFrame = contentArea.querySelector('.pause-frame');

      expect(pauseFrame).toBeTruthy();
    });

    it('should append multiple frames in order', () => {
      const frame1: Frame = { type: 'text', value: 'First' };
      const frame2: Frame = { type: 'text', value: 'Second' };

      renderer.renderFrame(frame1);
      renderer.renderFrame(frame2);

      const contentArea = container.querySelector('#content-area')!;
      const frames = contentArea.querySelectorAll('.frame');

      expect(frames).toHaveLength(2);
      expect(frames[0].textContent).toBe('First');
      expect(frames[1].textContent).toBe('Second');
    });
  });

  describe('renderChoices', () => {
    it('should render choice buttons', () => {
      const choices: Choice[] = [
        { text: 'Choice 1', goto: 'node_1' },
        { text: 'Choice 2', goto: 'node_2' }
      ];

      renderer.renderChoices(choices);

      const choicesArea = container.querySelector('#choices-area')!;
      const buttons = choicesArea.querySelectorAll('.choice-button');

      expect(buttons).toHaveLength(2);
      expect(buttons[0].textContent).toBe('Choice 1');
      expect(buttons[1].textContent).toBe('Choice 2');
    });

    it('should hide choices area when no choices', () => {
      renderer.renderChoices([]);

      const choicesArea = container.querySelector('#choices-area')! as HTMLElement;
      expect(choicesArea.style.display).toBe('none');
    });

    it('should show choices area when choices exist', () => {
      const choices: Choice[] = [{ text: 'Choice 1', goto: 'node_1' }];
      renderer.renderChoices(choices);

      const choicesArea = container.querySelector('#choices-area')! as HTMLElement;
      expect(choicesArea.style.display).toBe('block');
    });

    it('should call choice handler when button clicked', () => {
      const mockHandler = vi.fn();
      renderer.setChoiceHandler(mockHandler);

      const choices: Choice[] = [{ text: 'Choice 1', goto: 'node_1' }];
      renderer.renderChoices(choices);

      const button = container.querySelector('.choice-button') as HTMLButtonElement;
      button.click();

      expect(mockHandler).toHaveBeenCalledWith('Choice 1');
    });
  });

  describe('clearContent', () => {
    it('should clear content area', () => {
      const frame: Frame = { type: 'text', value: 'Test' };
      renderer.renderFrame(frame);
      renderer.clearContent();

      const contentArea = container.querySelector('#content-area')!;
      expect(contentArea?.innerHTML).toBe('');
    });

    it('should clear choices area', () => {
      const choices: Choice[] = [{ text: 'Choice 1', goto: 'node_1' }];
      renderer.renderChoices(choices);
      renderer.clearContent();

      const choicesArea = container.querySelector('#choices-area')!;
      expect(choicesArea?.innerHTML).toBe('');
    });
  });

  describe('showChapterTitle', () => {
    it('should render chapter title', () => {
      const chapter: Chapter = {
        id: 'chapter_1',
        title: 'Test Chapter',
        arc: 'calm_intro',
        nodes: ['node_1'],
        context: {}
      };

      renderer.showChapterTitle(chapter);

      const contentArea = container.querySelector('#content-area')!;
      const titleElement = contentArea.querySelector('.chapter-title');

      expect(titleElement).toBeTruthy();
      expect(titleElement?.textContent).toBe('Test Chapter');
    });
  });

  describe('showError', () => {
    it('should render error message', () => {
      renderer.showError('Test error');

      const contentArea = container.querySelector('#content-area')!;
      const errorElement = contentArea.querySelector('.error-message');

      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain('Test error');
    });
  });

  describe('setLoading', () => {
    it('should render loading state', () => {
      renderer.setLoading(true);

      const contentArea = container.querySelector('#content-area')!;
      const loadingElement = contentArea.querySelector('.loading');

      expect(loadingElement).toBeTruthy();
      expect(loadingElement?.textContent).toContain('Loading');
    });
  });
});
