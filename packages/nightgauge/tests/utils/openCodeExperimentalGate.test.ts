import { describe, it, expect, afterEach } from "vitest";
import {
  OPENCODE_ENABLE_SWITCH_ENV_VAR,
  isOpenCodeSwitchOn,
  openCodeGateMessage,
} from "../../src/utils/openCodeExperimentalGate";

describe("openCodeExperimentalGate (#1628)", () => {
  afterEach(() => {
    delete process.env[OPENCODE_ENABLE_SWITCH_ENV_VAR];
  });

  it("exports the expected environment variable name", () => {
    expect(OPENCODE_ENABLE_SWITCH_ENV_VAR).toBe("NIGHTGAUGE_EXPERIMENTAL_OPENCODE");
  });

  it("returns true only when the env var equals '1'", () => {
    process.env[OPENCODE_ENABLE_SWITCH_ENV_VAR] = "1";
    expect(isOpenCodeSwitchOn()).toBe(true);
  });

  it("returns false for any other value or when unset", () => {
    delete process.env[OPENCODE_ENABLE_SWITCH_ENV_VAR];
    expect(isOpenCodeSwitchOn()).toBe(false);

    process.env[OPENCODE_ENABLE_SWITCH_ENV_VAR] = "true";
    expect(isOpenCodeSwitchOn()).toBe(false);

    process.env[OPENCODE_ENABLE_SWITCH_ENV_VAR] = "yes";
    expect(isOpenCodeSwitchOn()).toBe(false);

    process.env[OPENCODE_ENABLE_SWITCH_ENV_VAR] = "0";
    expect(isOpenCodeSwitchOn()).toBe(false);

    process.env[OPENCODE_ENABLE_SWITCH_ENV_VAR] = "";
    expect(isOpenCodeSwitchOn()).toBe(false);
  });

  it("includes the environment variable name in the refusal message", () => {
    const msg = openCodeGateMessage();
    expect(msg).toContain("NIGHTGAUGE_EXPERIMENTAL_OPENCODE=1");
    expect(msg).toContain("OpenCode is experimental");
  });
});
