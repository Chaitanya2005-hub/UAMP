import { Injectable } from '@angular/core';

function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

@Injectable({ providedIn: 'root' })
export class LocalEncryptionService {
  private key: CryptoKey | null = null;

  /** Derives a per-session AES-GCM key from a server-issued session secret */
  async deriveKey(sessionSecret: string): Promise<void> {
    const material = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(sessionSecret),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    this.key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('uamp-exam-salt'),
        iterations: 100_000,
        hash: 'SHA-256',
      },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plaintext: string): Promise<{ ciphertext: string; iv: string }> {
    if (!this.key) throw new Error('Encryption key not derived. Call deriveKey() first.');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key, encoded);
    return { ciphertext: bufToBase64(cipherBuf), iv: bufToBase64(iv.buffer) };
  }

  async decrypt(ciphertextB64: string, ivB64: string): Promise<string> {
    if (!this.key) throw new Error('Encryption key not derived. Call deriveKey() first.');
    const cipherBuf = base64ToBuf(ciphertextB64);
    const iv = new Uint8Array(base64ToBuf(ivB64));
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, this.key, cipherBuf);
    return new TextDecoder().decode(plainBuf);
  }
}
