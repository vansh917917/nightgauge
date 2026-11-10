import { describe, it, expect, afterEach } from "vitest";
import { validatePemFile } from "../../src/utils/pemValidator";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("validatePemFile", () => {
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

  it("returns null when the file contains a valid PEM certificate header", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "pem-test-"));
    const certPath = join(tempDir, "valid.pem");
    writeFileSync(
      certPath,
      "-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A\n-----END CERTIFICATE-----"
    );

    const result = await validatePemFile(certPath);
    expect(result).toBeNull();
  });

  it("returns an error string when the file does not exist", async () => {
    const nonExistentPath = join(tmpdir(), "definitely-not-found-cert.pem");
    const result = await validatePemFile(nonExistentPath);

    expect(result).not.toBeNull();
    expect(result).toContain("Cannot read file");
  });

  it("returns an error string when the file lacks the BEGIN CERTIFICATE header", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "pem-invalid-test-"));
    const certPath = join(tempDir, "invalid.pem");
    writeFileSync(
      certPath,
      "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
    );

    const result = await validatePemFile(certPath);
    expect(result).not.toBeNull();
    expect(result).toContain(
      "File does not appear to be a PEM certificate bundle (missing -----BEGIN CERTIFICATE----- header)"
    );
  });
});
