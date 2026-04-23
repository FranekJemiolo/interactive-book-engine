import { Condition, ConditionGroup, State, ConditionVar, ConditionFlag } from "../types";

export class ConditionEvaluator {
  constructor(private state: State) {}

  evaluate(group: ConditionGroup): boolean {
    if (group.all) {
      return group.all.every((cond) => this.evaluateCondition(cond));
    }

    if (group.any) {
      return group.any.some((cond) => this.evaluateCondition(cond));
    }

    if (group.not) {
      return !this.evaluate(group.not);
    }

    return true;
  }

  private evaluateCondition(condition: Condition): boolean {
    if (this.isVarCondition(condition)) {
      return this.evaluateVarCondition(condition);
    }

    if (this.isFlagCondition(condition)) {
      return this.evaluateFlagCondition(condition);
    }

    return false;
  }

  private isVarCondition(condition: Condition): condition is ConditionVar {
    return "var" in condition;
  }

  private isFlagCondition(condition: Condition): condition is ConditionFlag {
    return "flag" in condition;
  }

  private evaluateVarCondition(condition: ConditionVar): boolean {
    const value = this.state.vars[condition.var];
    if (value === undefined) return false;

    switch (condition.op) {
      case ">":
        return value > condition.value;
      case "<":
        return value < condition.value;
      case ">=":
        return value >= condition.value;
      case "<=":
        return value <= condition.value;
      case "==":
        return value === condition.value;
      case "!=":
        return value !== condition.value;
      default:
        return false;
    }
  }

  private evaluateFlagCondition(condition: ConditionFlag): boolean {
    const value = this.state.flags[condition.flag];
    if (value === undefined) return false;
    return value === condition.equals;
  }
}
