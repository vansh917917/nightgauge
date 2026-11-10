import { describe, it, expect } from "vitest";
import { countFailedStages } from "../../src/utils/failedStages";

describe("failedStages (#1109)", () => {
  it("returns 0 for null or undefined states", () => {
    expect(countFailedStages(null)).toBe(0);
    expect(countFailedStages(undefined)).toBe(0);
  });

  it("returns 0 when stages record is missing or empty", () => {
    expect(countFailedStages({})).toBe(0);
    expect(countFailedStages({ stages: {} })).toBe(0);
  });

  it("returns 0 when no stage has failed", () => {
    const state = {
      stages: {
        planning: { status: "passed" },
        implementation: { status: "running" },
        validation: { status: "pending" },
      },
    };
    expect(countFailedStages(state)).toBe(0);
  });

  it("correctly counts failed stages", () => {
    const state = {
      stages: {
        planning: { status: "passed" },
        implementation: { status: "failed" },
        validation: { status: "failed" },
        "pr-create": { status: "skipped" },
      },
    };
    expect(countFailedStages(state)).toBe(2);
  });

  it("ignores undefined or null stage entries", () => {
    const state = {
      stages: {
        planning: undefined,
        implementation: null,
        validation: { status: "failed" },
      },
    };
    expect(countFailedStages(state)).toBe(1);
  });

  it("does not count retried stages that transitioned back to running", () => {
    // When a stage is retried, its status transitions from failed to running
    const state = {
      stages: {
        planning: { status: "passed" },
        implementation: { status: "running" },
      },
    };
    expect(countFailedStages(state)).toBe(0);
  });
});
