import { describe, it, expect, vi, afterEach } from "vitest";
import { isProcessAlive } from "../../src/utils/processAlive";

describe("processAlive", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false for non-positive or non-integer PIDs", () => {
    expect(isProcessAlive(0)).toBe(false);
    expect(isProcessAlive(-1)).toBe(false);
    expect(isProcessAlive(-999)).toBe(false);
    expect(isProcessAlive(12.34)).toBe(false);
    expect(isProcessAlive(NaN)).toBe(false);
    expect(isProcessAlive(Infinity)).toBe(false);
  });

  it("returns true for the current active process", () => {
    expect(isProcessAlive(process.pid)).toBe(true);
  });

  it("returns false when process does not exist (ESRCH)", () => {
    vi.spyOn(process, "kill").mockImplementation(() => {
      const err = new Error("kill ESRCH") as NodeJS.ErrnoException;
      err.code = "ESRCH";
      throw err;
    });

    expect(isProcessAlive(999999)).toBe(false);
  });

  it("returns true when process exists but belongs to another user (EPERM)", () => {
    vi.spyOn(process, "kill").mockImplementation(() => {
      const err = new Error("kill EPERM") as NodeJS.ErrnoException;
      err.code = "EPERM";
      throw err;
    });

    expect(isProcessAlive(1234)).toBe(true);
  });

  it("returns false for any other unexpected error", () => {
    vi.spyOn(process, "kill").mockImplementation(() => {
      const err = new Error("generic error") as NodeJS.ErrnoException;
      err.code = "EINVAL";
      throw err;
    });

    expect(isProcessAlive(1234)).toBe(false);
  });
});
