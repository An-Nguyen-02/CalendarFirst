import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
}

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || typeof raw !== "string") {
    throw new Error("ENCRYPTION_KEY is not set");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (base64 decoded)`);
  }
  return key;
}

/**
 * Encrypt plaintext with AES-256-GCM. Returns JSON-serializable object with base64-encoded ciphertext, iv, tag.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload: EncryptedPayload = {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
  return JSON.stringify(payload);
}

/**
 * Decrypt payload (JSON string from encrypt()) back to plaintext.
 */
export function decrypt(encryptedJson: string): string {
  const key = getKey();
  const payload = JSON.parse(encryptedJson) as EncryptedPayload;
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}
