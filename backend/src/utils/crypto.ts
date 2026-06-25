// src/utils/crypto.ts
import crypto from 'crypto';

// Siguraduhin na may fallback o error handling kung walang ENCRYPTION_KEY
const KEY_STRING = process.env.ENCRYPTION_KEY;

if (!KEY_STRING || KEY_STRING.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
}

const KEY = Buffer.from(KEY_STRING, 'hex'); 
const ALGORITHM = 'aes-256-gcm';

export const encrypt = (buffer: Buffer) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  return { encrypted, iv, authTag };
};

export const decrypt = (encryptedBuffer: Buffer, iv: Buffer, authTag: Buffer) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  
  // Napaka-importante: I-set ang authTag bago i-decrypt
  decipher.setAuthTag(authTag);
  
  // Decrypt the buffer
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
};