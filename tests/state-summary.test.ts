import { describe, it, expect } from 'vitest';
import { StateMapping, State } from '../src/types';

describe('State Summary Functionality', () => {
  describe('State Mapping Schema', () => {
    it('should map numeric variable with ranges', () => {
      const mapping: StateMapping = {
        var: 'trust',
        label: 'Trust Level',
        description: 'How much the characters trust you',
        ranges: [
          { min: 0, max: 2, label: 'Suspicious' },
          { min: 3, max: 5, label: 'Neutral' },
          { min: 6, max: 10, label: 'Trusted' }
        ]
      };

      expect(mapping.var).toBe('trust');
      expect(mapping.label).toBe('Trust Level');
      expect(mapping.ranges).toHaveLength(3);
    });

    it('should map boolean flag with custom values', () => {
      const mapping: StateMapping = {
        flag: 'has_key',
        label: 'Key Status',
        description: 'Whether you found the secret key',
        booleanValues: {
          true: 'Found',
          false: 'Missing'
        }
      };

      expect(mapping.flag).toBe('has_key');
      expect(mapping.booleanValues?.true).toBe('Found');
      expect(mapping.booleanValues?.false).toBe('Missing');
    });

    it('should allow mapping without description', () => {
      const mapping: StateMapping = {
        var: 'score',
        label: 'Score',
        ranges: [
          { min: 0, max: 50, label: 'Low' },
          { min: 51, max: 100, label: 'High' }
        ]
      };

      expect(mapping.description).toBeUndefined();
    });

    it('should allow mapping without ranges (direct value display)', () => {
      const mapping: StateMapping = {
        var: 'health',
        label: 'Health'
      };

      expect(mapping.ranges).toBeUndefined();
    });
  });

  describe('State Value Mapping Logic', () => {
    const getMappedValue = (mapping: StateMapping, state: State): string => {
      if (mapping.var && state.vars[mapping.var] !== undefined) {
        const value = state.vars[mapping.var];
        if (mapping.ranges) {
          for (const range of mapping.ranges) {
            if ((range.min === undefined || value >= range.min) && 
                (range.max === undefined || value <= range.max)) {
              return range.label;
            }
          }
          return value.toString();
        }
        return value.toString();
      }
      if (mapping.flag && state.flags[mapping.flag] !== undefined) {
        const value = state.flags[mapping.flag];
        if (mapping.booleanValues) {
          return value ? mapping.booleanValues.true : mapping.booleanValues.false;
        }
        return value ? 'True' : 'False';
      }
      return 'N/A';
    };

    it('should map numeric value to correct range label', () => {
      const mapping: StateMapping = {
        var: 'trust',
        label: 'Trust Level',
        ranges: [
          { min: 0, max: 2, label: 'Suspicious' },
          { min: 3, max: 5, label: 'Neutral' },
          { min: 6, max: 10, label: 'Trusted' }
        ]
      };

      const state: State = {
        vars: { trust: 7 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('Trusted');
    });

    it('should map numeric value in lower range', () => {
      const mapping: StateMapping = {
        var: 'trust',
        label: 'Trust Level',
        ranges: [
          { min: 0, max: 2, label: 'Suspicious' },
          { min: 3, max: 5, label: 'Neutral' },
          { min: 6, max: 10, label: 'Trusted' }
        ]
      };

      const state: State = {
        vars: { trust: 1 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('Suspicious');
    });

    it('should map numeric value in middle range', () => {
      const mapping: StateMapping = {
        var: 'trust',
        label: 'Trust Level',
        ranges: [
          { min: 0, max: 2, label: 'Suspicious' },
          { min: 3, max: 5, label: 'Neutral' },
          { min: 6, max: 10, label: 'Trusted' }
        ]
      };

      const state: State = {
        vars: { trust: 4 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('Neutral');
    });

    it('should return raw value when no ranges defined', () => {
      const mapping: StateMapping = {
        var: 'score',
        label: 'Score'
      };

      const state: State = {
        vars: { score: 42 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('42');
    });

    it('should map boolean flag to custom true value', () => {
      const mapping: StateMapping = {
        flag: 'has_key',
        label: 'Key Status',
        booleanValues: {
          true: 'Found',
          false: 'Missing'
        }
      };

      const state: State = {
        vars: {},
        flags: { has_key: true },
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('Found');
    });

    it('should map boolean flag to custom false value', () => {
      const mapping: StateMapping = {
        flag: 'has_key',
        label: 'Key Status',
        booleanValues: {
          true: 'Found',
          false: 'Missing'
        }
      };

      const state: State = {
        vars: {},
        flags: { has_key: false },
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('Missing');
    });

    it('should map boolean flag to default values when no custom values', () => {
      const mapping: StateMapping = {
        flag: 'is_alive',
        label: 'Alive Status'
      };

      const state: State = {
        vars: {},
        flags: { is_alive: true },
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('True');
    });

    it('should return N/A when variable not found in state', () => {
      const mapping: StateMapping = {
        var: 'nonexistent',
        label: 'Nonexistent'
      };

      const state: State = {
        vars: {},
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('N/A');
    });

    it('should return N/A when flag not found in state', () => {
      const mapping: StateMapping = {
        flag: 'nonexistent',
        label: 'Nonexistent'
      };

      const state: State = {
        vars: {},
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('N/A');
    });

    it('should handle ranges with only min defined', () => {
      const mapping: StateMapping = {
        var: 'level',
        label: 'Level',
        ranges: [
          { min: 0, label: 'Beginner' },
          { min: 10, label: 'Advanced' }
        ]
      };

      const state: State = {
        vars: { level: 15 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      // First matching range is returned (15 >= 0 matches Beginner)
      expect(result).toBe('Beginner');
    });

    it('should handle ranges with only max defined', () => {
      const mapping: StateMapping = {
        var: 'danger',
        label: 'Danger Level',
        ranges: [
          { max: 5, label: 'Safe' },
          { max: 10, label: 'Dangerous' }
        ]
      };

      const state: State = {
        vars: { danger: 3 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('Safe');
    });
  });

  describe('Multiple State Mappings', () => {
    const getMappedValue = (mapping: StateMapping, state: State): string => {
      if (mapping.var && state.vars[mapping.var] !== undefined) {
        const value = state.vars[mapping.var];
        if (mapping.ranges) {
          for (const range of mapping.ranges) {
            if ((range.min === undefined || value >= range.min) && 
                (range.max === undefined || value <= range.max)) {
              return range.label;
            }
          }
          return value.toString();
        }
        return value.toString();
      }
      if (mapping.flag && state.flags[mapping.flag] !== undefined) {
        const value = state.flags[mapping.flag];
        if (mapping.booleanValues) {
          return value ? mapping.booleanValues.true : mapping.booleanValues.false;
        }
        return value ? 'True' : 'False';
      }
      return 'N/A';
    };

    it('should map multiple state values correctly', () => {
      const mappings: StateMapping[] = [
        {
          var: 'trust',
          label: 'Trust Level',
          ranges: [
            { min: 0, max: 2, label: 'Suspicious' },
            { min: 3, max: 5, label: 'Neutral' },
            { min: 6, max: 10, label: 'Trusted' }
          ]
        },
        {
          flag: 'has_key',
          label: 'Key Status',
          booleanValues: {
            true: 'Found',
            false: 'Missing'
          }
        }
      ];

      const state: State = {
        vars: { trust: 7 },
        flags: { has_key: true },
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const results = mappings.map(m => getMappedValue(m, state));
      expect(results).toEqual(['Trusted', 'Found']);
    });
  });
});
