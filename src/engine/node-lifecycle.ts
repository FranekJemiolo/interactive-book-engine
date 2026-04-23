import { Node, State, NodeRuntimePhase, Choice, AutoTransition, Arc } from "../types";
import { ConditionEvaluator } from "../core/conditions";
import { StateStore } from "../state/store";
import { PacingSystem } from "./pacing-system";

export class NodeLifecycleEngine {
  private currentPhase: NodeRuntimePhase = "enter";
  private currentNode: Node | null = null;
  private pacingSystem: PacingSystem;

  constructor(
    private stateStore: StateStore,
    private onPhaseChange?: (phase: NodeRuntimePhase) => void,
    private onFrameRender?: (frame: any, index: number) => void,
    private onChoicesRender?: (choices: Choice[]) => void,
    arcPacing?: Arc
  ) {
    this.pacingSystem = new PacingSystem(arcPacing);
  }

  async executeNode(node: Node): Promise<void> {
    this.currentNode = node;
    const state = this.stateStore.getState();

    // Mark node as visited
    this.stateStore.visitNode(node.id);

    // ENTER phase
    this.setPhase("enter");

    // APPLY CHAPTER CONTEXT
    this.setPhase("pacing");

    // Set pacing for this node
    this.pacingSystem.setPacing(node.pacing || null);

    // RUN PACING (optional)
    await this.pacingSystem.applyIntroDelay();

    // RENDER FRAMES (sequential)
    this.setPhase("render");
    for (let i = 0; i < node.content.length; i++) {
      const frame = node.content[i];
      await this.renderFrame(frame, i);
    }

    // RUN AUTO TRANSITIONS
    this.setPhase("auto");
    const autoTransition = this.findAutoTransition(node.auto, state);
    if (autoTransition) {
      this.setPhase("exit");
      throw new AutoTransitionError(autoTransition.goto);
    }

    // SUSPENSE PAUSE BEFORE CHOICES
    await this.pacingSystem.applySuspensePause();

    // RENDER CHOICES
    this.setPhase("choice");
    const visibleChoices = this.getVisibleChoices(node.choices || [], state);
    this.onChoicesRender?.(visibleChoices);

    // WAIT INPUT - handled by UI
    this.setPhase("exit");
  }

  async makeChoice(choiceId: string): Promise<string> {
    if (!this.currentNode) {
      throw new Error("No current node");
    }

    const state = this.stateStore.getState();
    const choice = this.currentNode.choices?.find((c) => c.text === choiceId);

    if (!choice) {
      throw new Error(`Choice not found: ${choiceId}`);
    }

    // Check if choice is available
    if (!this.isChoiceVisible(choice, state)) {
      throw new Error(`Choice not available: ${choiceId}`);
    }

    // Record choice
    this.stateStore.makeChoice(choiceId);

    // Apply choice effects (if any - for future expansion)
    // For now, choices only navigate

    return choice.goto;
  }

  private setPhase(phase: NodeRuntimePhase): void {
    this.currentPhase = phase;
    this.onPhaseChange?.(phase);
  }

  private async renderFrame(frame: any, index: number): Promise<void> {
    this.onFrameRender?.(frame, index);

    // Handle frame delays using pacing system
    if (frame.delay) {
      await this.pacingSystem.applyFrameDelay(frame.delay);
    }

    // Handle pause frames
    if (frame.type === "pause") {
      await this.delay(frame.duration);
    }
  }

  private findAutoTransition(
    autoTransitions: AutoTransition[] | undefined,
    state: State
  ): AutoTransition | null {
    if (!autoTransitions || autoTransitions.length === 0) {
      return null;
    }

    const evaluator = new ConditionEvaluator(state);

    for (const transition of autoTransitions) {
      if (evaluator.evaluate(transition.if)) {
        return transition;
      }
    }

    return null;
  }

  private getVisibleChoices(choices: Choice[], state: State): Choice[] {
    return choices.filter((choice) => this.isChoiceVisible(choice, state));
  }

  private isChoiceVisible(choice: Choice, state: State): boolean {
    const evaluator = new ConditionEvaluator(state);

    // Check if hidden
    if (choice.hiddenIf && evaluator.evaluate(choice.hiddenIf)) {
      return false;
    }

    // Check if requirements are met
    if (choice.require && !evaluator.evaluate(choice.require)) {
      return false;
    }

    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  skip(mode: "visual" | "full"): void {
    if (mode === "visual") {
      // Visual skip - affects rendering only
      this.pacingSystem.setFastForward(true);
    } else if (mode === "full") {
      // Full advance skip - completes node immediately
      // This would trigger auto-transitions if valid
      // For MVP, we'll implement this as throwing an error to signal skip
      throw new SkipError("full");
    }
  }

  getCurrentPhase(): NodeRuntimePhase {
    return this.currentPhase;
  }
}

export class AutoTransitionError extends Error {
  constructor(public goto: string) {
    super("Auto transition triggered");
    this.name = "AutoTransitionError";
  }
}

export class SkipError extends Error {
  constructor(public mode: string) {
    super("Skip triggered");
    this.name = "SkipError";
  }
}
