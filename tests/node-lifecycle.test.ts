import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeLifecycleEngine, AutoTransitionError } from '../src/engine/node-lifecycle';
import { StateStore } from '../src/state/store';
import { Node, State } from '../src/types';

describe('NodeLifecycleEngine', () => {
  let engine: NodeLifecycleEngine;
  let stateStore: StateStore;

  beforeEach(() => {
    stateStore = new StateStore();
    engine = new NodeLifecycleEngine(
      stateStore,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      { pacing: { frameDelay: 100 } } // Use shorter delays for tests
    );
    // Set fast-forward mode to skip delays in tests
    (engine as any).pacingSystem.setFastForward(true);
  });

  describe('executeNode', () => {
    it('should mark node as visited', async () => {
      const node: Node = {
        id: 'node_1',
        content: [
          { type: 'text', value: 'Test content' }
        ],
        choices: []
      };

      await engine.executeNode(node);
      const state = stateStore.getState();

      expect(state.meta.visitedNodes).toContain('node_1');
    });

    it('should render all frames', async () => {
      const mockRenderFrame = vi.fn();
      engine = new NodeLifecycleEngine(
        stateStore,
        vi.fn(),
        mockRenderFrame,
        vi.fn(),
        { pacing: { frameDelay: 100 } } // Use shorter delays for tests
      );
      (engine as any).pacingSystem.setFastForward(true);

      const node: Node = {
        id: 'node_1',
        content: [
          { type: 'text', value: 'First' },
          { type: 'text', value: 'Second' },
          { type: 'pause', duration: 100 as any }
        ],
        choices: []
      };

      await engine.executeNode(node);

      expect(mockRenderFrame).toHaveBeenCalledTimes(3);
    });

    it('should render choices', async () => {
      const mockRenderChoices = vi.fn();
      engine = new NodeLifecycleEngine(
        stateStore,
        vi.fn(),
        vi.fn(),
        mockRenderChoices,
        { pacing: { frameDelay: 100 } } // Use shorter delays for tests
      );
      (engine as any).pacingSystem.setFastForward(true);

      const node: Node = {
        id: 'node_1',
        content: [{ type: 'text', value: 'Test' }],
        choices: [
          { text: 'Choice 1', goto: 'node_2' },
          { text: 'Choice 2', goto: 'node_3' }
        ]
      };

      await engine.executeNode(node);

      expect(mockRenderChoices).toHaveBeenCalledWith([
        { text: 'Choice 1', goto: 'node_2' },
        { text: 'Choice 2', goto: 'node_3' }
      ]);
    });

    it('should not render choices if node has no choices', async () => {
      const mockRenderChoices = vi.fn();
      engine = new NodeLifecycleEngine(
        stateStore,
        vi.fn(),
        vi.fn(),
        mockRenderChoices,
        { pacing: { frameDelay: 100 } } // Use shorter delays for tests
      );
      (engine as any).pacingSystem.setFastForward(true);

      const node: Node = {
        id: 'node_1',
        content: [{ type: 'text', value: 'Test' }],
        choices: []
      };

      await engine.executeNode(node);

      expect(mockRenderChoices).toHaveBeenCalledWith([]);
    });

    it('should trigger AutoTransitionError if auto transition matches', async () => {
      stateStore = new StateStore();
      stateStore.setVar('test_var', 1);
      
      engine = new NodeLifecycleEngine(
        stateStore,
        vi.fn(),
        vi.fn(),
        vi.fn(),
        { pacing: { frameDelay: 100 } } // Use shorter delays for tests
      );
      (engine as any).pacingSystem.setFastForward(true);

      const node: Node = {
        id: 'node_1',
        content: [{ type: 'text', value: 'Test' }],
        choices: [],
        auto: [
          {
            if: { var: 'test_var', eq: 1 },
            goto: 'node_2'
          } as any
        ]
      };

      await expect(engine.executeNode(node)).rejects.toThrow(AutoTransitionError);
    });
  });

  describe('makeChoice', () => {
    beforeEach(async () => {
      const node: Node = {
        id: 'node_1',
        content: [{ type: 'text', value: 'Test' }],
        choices: [
          { text: 'Choice 1', goto: 'node_2' },
          { text: 'Choice 2', goto: 'node_3' }
        ]
      };
      engine = new NodeLifecycleEngine(
        stateStore,
        vi.fn(),
        vi.fn(),
        vi.fn(),
        { pacing: { frameDelay: 100 } } // Use shorter delays for tests
      );
      (engine as any).pacingSystem.setFastForward(true);
      await engine.executeNode(node);
    });

    it('should return goto for valid choice', async () => {
      const result = await engine.makeChoice('Choice 1');
      expect(result).toBe('node_2');
    });

    it('should record choice in state', async () => {
      await engine.makeChoice('Choice 1');
      const state = stateStore.getState();
      expect(state.meta.choicesMade).toContain('Choice 1');
    });

    it('should throw error if choice not found', async () => {
      await expect(engine.makeChoice('Invalid Choice')).rejects.toThrow('Choice not found');
    });
  });

  describe('skip', () => {
    it('should set fast forward mode for visual skip', () => {
      engine.skip('visual');
      // This would affect the pacing system
      // For now, we just verify it doesn't throw
    });
  });

  describe('getCurrentPhase', () => {
    it('should return current phase', async () => {
      const mockPhaseChange = vi.fn();
      engine = new NodeLifecycleEngine(
        stateStore,
        mockPhaseChange,
        vi.fn(),
        vi.fn(),
        { pacing: { frameDelay: 100 } } // Use shorter delays for tests
      );
      (engine as any).pacingSystem.setFastForward(true);

      const node: Node = {
        id: 'node_1',
        content: [{ type: 'text', value: 'Test' }],
        choices: []
      };

      await engine.executeNode(node);

      expect(mockPhaseChange).toHaveBeenCalled();
    });
  });
});
