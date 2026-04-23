import { State } from "../types";

export class StateStore {
  private state: State;
  private listeners: Set<(state: State) => void> = new Set();

  constructor(initialState?: Partial<State>) {
    this.state = {
      vars: initialState?.vars || {},
      flags: initialState?.flags || {},
      global: initialState?.global || {},
      chapter: initialState?.chapter || { id: "", context: {} },
      meta: initialState?.meta || {
        visitedNodes: [],
        choicesMade: [],
        startedAt: Date.now(),
      },
    };
  }

  getState(): State {
    return JSON.parse(JSON.stringify(this.state));
  }

  setVar(key: string, value: number): void {
    this.state.vars[key] = value;
    this.notify();
  }

  getVar(key: string): number | undefined {
    return this.state.vars[key];
  }

  setFlag(key: string, value: boolean): void {
    this.state.flags[key] = value;
    this.notify();
  }

  getFlag(key: string): boolean | undefined {
    return this.state.flags[key];
  }

  setGlobal(key: string, value: any): void {
    this.state.global[key] = value;
    this.notify();
  }

  getGlobal(key: string): any {
    return this.state.global[key];
  }

  setChapter(id: string, context?: Record<string, any>): void {
    this.state.chapter = {
      id,
      context: context || {},
    };
    this.notify();
  }

  setChapterContext(key: string, value: any): void {
    this.state.chapter.context[key] = value;
    this.notify();
  }

  visitNode(nodeId: string): void {
    if (!this.state.meta.visitedNodes.includes(nodeId)) {
      this.state.meta.visitedNodes.push(nodeId);
      this.notify();
    }
  }

  makeChoice(choiceId: string): void {
    if (!this.state.meta.choicesMade.includes(choiceId)) {
      this.state.meta.choicesMade.push(choiceId);
      this.notify();
    }
  }

  subscribe(listener: (state: State) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const stateSnapshot = this.getState();
    this.listeners.forEach((listener) => listener(stateSnapshot));
  }

  serialize(): string {
    return JSON.stringify(this.state);
  }

  deserialize(serialized: string): void {
    try {
      this.state = JSON.parse(serialized);
      this.notify();
    } catch (e) {
      console.error("Failed to deserialize state:", e);
    }
  }

  reset(): void {
    this.state = {
      vars: {},
      flags: {},
      global: {},
      chapter: { id: "", context: {} },
      meta: {
        visitedNodes: [],
        choicesMade: [],
        startedAt: Date.now(),
      },
    };
    this.notify();
  }
}
