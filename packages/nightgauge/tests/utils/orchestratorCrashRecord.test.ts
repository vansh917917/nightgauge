import { describe, it, expect } from "vitest";
import {
  ORCHESTRATOR_CRASH_TERMINAL_KIND,
  isOrchestratorCrashRecord,
} from "../../src/utils/orchestratorCrashRecord";

describe("orchestratorCrashRecord (#447)", () => {
  it("exports the expected constant string", () => {
    expect(ORCHESTRATOR_CRASH_TERMINAL_KIND).toBe("orchestrator_crash");
  });

  it("returns true for an object with terminal_failure_kind set to orchestrator_crash", () => {
    const record = {
      run_id: "run-abc",
      terminal_failure_kind: "orchestrator_crash",
      cost_usd: 0,
    };
    expect(isOrchestratorCrashRecord(record)).toBe(true);
  });

  it("returns false when terminal_failure_kind is a different kind", () => {
    expect(isOrchestratorCrashRecord({ terminal_failure_kind: "timeout" })).toBe(false);
    expect(isOrchestratorCrashRecord({ terminal_failure_kind: "budget_breached" })).toBe(false);
    expect(isOrchestratorCrashRecord({ terminal_failure_kind: "user_cancelled" })).toBe(false);
  });

  it("returns false for non-object or nullish values", () => {
    expect(isOrchestratorCrashRecord(null)).toBe(false);
    expect(isOrchestratorCrashRecord(undefined)).toBe(false);
    expect(isOrchestratorCrashRecord("orchestrator_crash")).toBe(false);
    expect(isOrchestratorCrashRecord(12345)).toBe(false);
    expect(isOrchestratorCrashRecord({})).toBe(false);
    expect(isOrchestratorCrashRecord([])).toBe(false);
  });
});
