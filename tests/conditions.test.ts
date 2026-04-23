import { describe, it, expect } from "vitest";
import { ConditionEvaluator } from "../src/core/conditions";
import { State } from "../src/types";

describe("ConditionEvaluator", () => {
  it("should evaluate var conditions with > operator", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: ">", value: 3 }],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: ">", value: 10 }],
      })
    ).toBe(false);
  });

  it("should evaluate var conditions with < operator", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: "<", value: 10 }],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: "<", value: 3 }],
      })
    ).toBe(false);
  });

  it("should evaluate var conditions with >= operator", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: ">=", value: 5 }],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: ">=", value: 10 }],
      })
    ).toBe(false);
  });

  it("should evaluate var conditions with <= operator", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: "<=", value: 5 }],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: "<=", value: 3 }],
      })
    ).toBe(false);
  });

  it("should evaluate var conditions with == operator", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: "==", value: 5 }],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: "==", value: 3 }],
      })
    ).toBe(false);
  });

  it("should evaluate var conditions with != operator", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: "!=", value: 3 }],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: "!=", value: 5 }],
      })
    ).toBe(false);
  });

  it("should evaluate flag conditions", () => {
    const state: State = {
      vars: {},
      flags: { has_key: true },
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ flag: "has_key", equals: true }],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        all: [{ flag: "has_key", equals: false }],
      })
    ).toBe(false);
  });

  it("should evaluate all conditions (AND)", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: { has_key: true },
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [
          { var: "trust", op: ">=", value: 3 },
          { flag: "has_key", equals: true },
        ],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        all: [
          { var: "trust", op: ">=", value: 10 },
          { flag: "has_key", equals: true },
        ],
      })
    ).toBe(false);
  });

  it("should evaluate any conditions (OR)", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: { has_key: false },
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        any: [
          { var: "trust", op: ">=", value: 3 },
          { flag: "has_key", equals: true },
        ],
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        any: [
          { var: "trust", op: ">=", value: 10 },
          { flag: "has_key", equals: true },
        ],
      })
    ).toBe(false);
  });

  it("should evaluate not conditions", () => {
    const state: State = {
      vars: { trust: 5 },
      flags: { has_key: true },
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        not: {
          all: [{ flag: "has_key", equals: false }],
        },
      })
    ).toBe(true);

    expect(
      evaluator.evaluate({
        not: {
          all: [{ flag: "has_key", equals: true }],
        },
      })
    ).toBe(false);
  });

  it("should handle missing vars gracefully", () => {
    const state: State = {
      vars: {},
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ var: "trust", op: ">=", value: 3 }],
      })
    ).toBe(false);
  });

  it("should handle missing flags gracefully", () => {
    const state: State = {
      vars: {},
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: { visitedNodes: [], choicesMade: [], startedAt: Date.now() },
    };

    const evaluator = new ConditionEvaluator(state);

    expect(
      evaluator.evaluate({
        all: [{ flag: "has_key", equals: true }],
      })
    ).toBe(false);
  });
});
