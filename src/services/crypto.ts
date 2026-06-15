// ============================================================
// நினைவு (Ninaivu) — Crypto Service
// Web Crypto API wrapper for local encryption/decryption
// ============================================================

const ALGO = 'AES-GCM';
const PBKDF2_ITERATIONS = 100000;

async function getPasswordKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Use a fixed salt for simplicity in this demo. 
  // In production, salt should be random per user and stored.
  const salt = enc.encode('ninaivu-salt-v1');

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGO, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptData(data: string, password?: string): Promise<string> {
  if (!password) return data; // Fallback if no password provided (e.g. not sensitive)
  
  const key = await getPasswordKey(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    enc.encode(data)
  );

  // Pack IV and Ciphertext together
  const packed = new Uint8Array(iv.length + ciphertext.byteLength);
  packed.set(iv);
  packed.set(new Uint8Array(ciphertext), iv.length);

  return bufferToBase64(packed.buffer);
}

export async function decryptData(encryptedBase64: string, password?: string): Promise<string> {
  if (!password) return encryptedBase64;

  try {
    const key = await getPasswordKey(password);
    const packed = new Uint8Array(base64ToBuffer(encryptedBase64));
    
    const iv = packed.slice(0, 12);
    const ciphertext = packed.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: ALGO, iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error('Decryption failed', err);
    throw new Error('Invalid password or corrupted data');
  }
}
