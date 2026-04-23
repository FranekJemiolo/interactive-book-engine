// Core Types for Interactive Narrative Book Engine (INBE)

export type Frame =
  | { type: "text"; value: string; delay?: number }
  | { type: "image"; src: string; delay?: number }
  | { type: "pause"; duration: number };

export interface ConditionVar {
  var: string;
  op: ">" | "<" | ">=" | "<=" | "==" | "!=";
  value: number;
}

export interface ConditionFlag {
  flag: string;
  equals: boolean;
}

export type Condition = ConditionVar | ConditionFlag;

export interface ConditionGroup {
  all?: Condition[];
  any?: Condition[];
  not?: ConditionGroup;
}

export interface Choice {
  text: string;
  goto: string;
  require?: ConditionGroup;
  hiddenIf?: ConditionGroup;
  timing?: {
    urgency?: "none" | "soft" | "hard";
    timeout?: number;
    autoSelect?: boolean;
  };
}

export interface AutoTransition {
  goto: string;
  if: ConditionGroup;
}

export interface PacingConfig {
  introDelay?: number;
  frameDelayMultiplier?: number;
  suspensePauseBeforeChoices?: number;
}

export interface Node {
  id: string;
  content: Frame[];
  choices?: Choice[];
  auto?: AutoTransition[];
  pacing?: PacingConfig;
}

export interface Chapter {
  id: string;
  title: string;
  arc: string;
  nodes: string[];
  context?: Record<string, any>;
}

export interface Arc {
  pacing?: {
    frameDelay?: number;
    suspense?: "low" | "medium" | "high";
  };
  visuals?: {
    tone?: string;
  };
  choices?: {
    urgency?: "none" | "soft" | "hard";
  };
}

export interface Book {
  title: string;
  chapters: Chapter[];
  arcs: Record<string, Arc>;
}

export interface State {
  vars: Record<string, number>;
  flags: Record<string, boolean>;
  global: Record<string, any>;
  chapter: {
    id: string;
    context: Record<string, any>;
  };
  meta: {
    visitedNodes: string[];
    choicesMade: string[];
    startedAt: number;
  };
}

export interface Progress {
  chapters: Record<
    string,
    {
      visitedNodes: string[];
    }
  >;
  lastChapter: string;
  lastNode: string;
}

export type NodeRuntimePhase =
  | "enter"
  | "pacing"
  | "render"
  | "auto"
  | "choice"
  | "exit";

export interface BookProvider {
  loadBook(): Promise<Book>;
  getNode(id: string): Promise<Node>;
  getChapter(id: string): Promise<Chapter>;
}
