import { describe, it, expect, afterEach } from "vitest";
import { isRepoInitialized } from "../../src/utils/repoInitialized";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("isRepoInitialized (#901)", () => {
  let tempDir: string | undefined;

  afterEach(() => {
    if (tempDir) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup failure
      }
      tempDir = undefined;
    }
  });

  it("returns true when .nightgauge/config.yaml exists and is a file", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "repo-init-test-"));
    const dotDir = join(tempDir, ".nightgauge");
    mkdirSync(dotDir, { recursive: true });
    writeFileSync(join(dotDir, "config.yaml"), "version: 1\n");

    const initialized = await isRepoInitialized(tempDir);
    expect(initialized).toBe(true);
  });

  it("returns false when .nightgauge directory does not exist", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "repo-empty-test-"));
    const initialized = await isRepoInitialized(tempDir);
    expect(initialized).toBe(false);
  });

  it("returns false when .nightgauge exists but config.yaml is missing", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "repo-noconfig-test-"));
    const dotDir = join(tempDir, ".nightgauge");
    mkdirSync(dotDir, { recursive: true });

    const initialized = await isRepoInitialized(tempDir);
    expect(initialized).toBe(false);
  });

  it("returns false when .nightgauge/config.yaml is a directory instead of a file", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "repo-dirconfig-test-"));
    const fakeConfigDir = join(tempDir, ".nightgauge", "config.yaml");
    mkdirSync(fakeConfigDir, { recursive: true });

    const initialized = await isRepoInitialized(tempDir);
    expect(initialized).toBe(false);
  });
});
