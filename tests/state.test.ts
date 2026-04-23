import { describe, it, expect, beforeEach } from "vitest";
import { StateStore } from "../src/state/store";

describe("StateStore", () => {
  let store: StateStore;

  beforeEach(() => {
    store = new StateStore();
  });

  it("should initialize with empty state", () => {
    const state = store.getState();
    expect(state.vars).toEqual({});
    expect(state.flags).toEqual({});
    expect(state.global).toEqual({});
    expect(state.chapter).toEqual({ id: "", context: {} });
    expect(state.meta.visitedNodes).toEqual([]);
    expect(state.meta.choicesMade).toEqual([]);
  });

  it("should set and get vars", () => {
    store.setVar("trust", 5);
    expect(store.getVar("trust")).toBe(5);
  });

  it("should set and get flags", () => {
    store.setFlag("has_key", true);
    expect(store.getFlag("has_key")).toBe(true);
  });

  it("should set and get global values", () => {
    store.setGlobal("player_name", "Alice");
    expect(store.getGlobal("player_name")).toBe("Alice");
  });

  it("should set chapter", () => {
    store.setChapter("chapter_1", { location: "station" });
    const state = store.getState();
    expect(state.chapter.id).toBe("chapter_1");
    expect(state.chapter.context).toEqual({ location: "station" });
  });

  it("should visit nodes", () => {
    store.visitNode("node_1");
    store.visitNode("node_2");
    const state = store.getState();
    expect(state.meta.visitedNodes).toEqual(["node_1", "node_2"]);
  });

  it("should not duplicate visited nodes", () => {
    store.visitNode("node_1");
    store.visitNode("node_1");
    const state = store.getState();
    expect(state.meta.visitedNodes).toEqual(["node_1"]);
  });

  it("should record choices", () => {
    store.makeChoice("choice_1");
    store.makeChoice("choice_2");
    const state = store.getState();
    expect(state.meta.choicesMade).toEqual(["choice_1", "choice_2"]);
  });

  it("should not duplicate choices", () => {
    store.makeChoice("choice_1");
    store.makeChoice("choice_1");
    const state = store.getState();
    expect(state.meta.choicesMade).toEqual(["choice_1"]);
  });

  it("should notify subscribers on state change", () => {
    let notified = false;
    const unsubscribe = store.subscribe(() => {
      notified = true;
    });

    store.setVar("test", 1);
    expect(notified).toBe(true);

    unsubscribe();
  });

  it("should serialize and deserialize state", () => {
    store.setVar("trust", 5);
    store.setFlag("has_key", true);
    store.visitNode("node_1");

    const serialized = store.serialize();
    const newStore = new StateStore();
    newStore.deserialize(serialized);

    const newState = newStore.getState();
    expect(newState.vars.trust).toBe(5);
    expect(newState.flags.has_key).toBe(true);
    expect(newState.meta.visitedNodes).toEqual(["node_1"]);
  });

  it("should reset state", () => {
    store.setVar("trust", 5);
    store.setFlag("has_key", true);
    store.visitNode("node_1");

    store.reset();

    const state = store.getState();
    expect(state.vars).toEqual({});
    expect(state.flags).toEqual({});
    expect(state.meta.visitedNodes).toEqual([]);
    expect(state.meta.choicesMade).toEqual([]);
  });
});
