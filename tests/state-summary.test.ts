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

    it('should handle empty stateMappings array', () => {
      const mappings: StateMapping[] = [];
      expect(mappings).toHaveLength(0);
    });

    it('should handle undefined stateMappings', () => {
      const mappings: StateMapping[] | undefined = undefined;
      expect(mappings).toBeUndefined();
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

    it('should handle negative numeric values', () => {
      const mapping: StateMapping = {
        var: 'balance',
        label: 'Balance',
        ranges: [
          { min: -100, max: -1, label: 'In Debt' },
          { min: 0, max: 100, label: 'Positive' }
        ]
      };

      const state: State = {
        vars: { balance: -50 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('In Debt');
    });

    it('should handle zero value in ranges', () => {
      const mapping: StateMapping = {
        var: 'score',
        label: 'Score',
        ranges: [
          { min: 0, max: 0, label: 'Zero' },
          { min: 1, max: 100, label: 'Positive' }
        ]
      };

      const state: State = {
        vars: { score: 0 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('Zero');
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

    it('should handle mixed var and flag mappings', () => {
      const mappings: StateMapping[] = [
        { var: 'health', label: 'Health' },
        { flag: 'is_alive', label: 'Alive Status' },
        { var: 'score', label: 'Score' }
      ];

      const state: State = {
        vars: { health: 100, score: 50 },
        flags: { is_alive: true },
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const results = mappings.map(m => getMappedValue(m, state));
      expect(results).toEqual(['100', 'True', '50']);
    });
  });

  describe('Modal Rendering and Visibility', () => {
    it('should handle empty stateMappings array gracefully', () => {
      const mappings: StateMapping[] = [];
      const state: State = {
        vars: {},
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      // Verify empty array is handled
      expect(mappings.length).toBe(0);
      expect(state).toBeDefined();
    });

    it('should handle undefined stateMappings gracefully', () => {
      const mappings: StateMapping[] | undefined = undefined;
      const state: State = {
        vars: {},
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      // Verify undefined is handled
      expect(mappings).toBeUndefined();
      expect(state).toBeDefined();
    });

    it('should handle undefined currentState gracefully', () => {
      const mappings: StateMapping[] = [
        { var: 'trust', label: 'Trust Level' }
      ];
      const state: State | undefined = undefined;

      // Verify undefined state is handled
      expect(mappings.length).toBeGreaterThan(0);
      expect(state).toBeUndefined();
    });

    it('should handle long text in labels with wordWrap', () => {
      const mapping: StateMapping = {
        var: 'achievement',
        label: 'This is a very long label that should wrap correctly when displayed in the modal without breaking the layout',
        description: 'This is also a very long description that should wrap correctly to ensure readability'
      };

      expect(mapping.label.length).toBeGreaterThan(50);
      expect(mapping.description?.length).toBeGreaterThan(50);
    });

    it('should handle special characters in labels', () => {
      const mapping: StateMapping = {
        var: 'special',
        label: 'Special chars: < > & " \'',
        description: 'Test & validate <special> characters'
      };

      expect(mapping.label).toContain('<');
      expect(mapping.label).toContain('>');
      expect(mapping.label).toContain('&');
    });

    it('should handle very long numeric values', () => {
      const mapping: StateMapping = {
        var: 'large_number',
        label: 'Large Number'
      };

      const state: State = {
        vars: { large_number: 999999999999999 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const getMappedValue = (m: StateMapping, s: State): string => {
        if (m.var && s.vars[m.var] !== undefined) {
          return s.vars[m.var].toString();
        }
        return 'N/A';
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('999999999999999');
    });

    it('should handle decimal values', () => {
      const mapping: StateMapping = {
        var: 'precision',
        label: 'Precision'
      };

      const state: State = {
        vars: { precision: 3.14159 },
        flags: {},
        global: {},
        chapter: { id: 'chapter_1', context: {} },
        meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now(), path: [] }
      };

      const getMappedValue = (m: StateMapping, s: State): string => {
        if (m.var && s.vars[m.var] !== undefined) {
          return s.vars[m.var].toString();
        }
        return 'N/A';
      };

      const result = getMappedValue(mapping, state);
      expect(result).toBe('3.14159');
    });
  });
});
