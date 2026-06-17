// ============================================================
// நினைவு (Ninaivu) — Crypto Service
// Web Crypto API wrapper for local encryption/decryption
// ============================================================

const ALGO = 'AES-GCM';
const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

async function getPasswordKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

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
  
  // Generate random salt and IV for each encryption
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await getPasswordKey(password, salt);
  const enc = new TextEncoder();

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    enc.encode(data)
  );

  // Pack: salt + IV + ciphertext
  const packed = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
  packed.set(salt);
  packed.set(iv, SALT_LENGTH);
  packed.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

  return bufferToBase64(packed.buffer);
}

export async function decryptData(encryptedBase64: string, password?: string): Promise<string> {
  if (!password) return encryptedBase64;

  try {
    const packed = new Uint8Array(base64ToBuffer(encryptedBase64));
    
    // Unpack: salt + IV + ciphertext
    const salt = packed.slice(0, SALT_LENGTH);
    const iv = packed.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = packed.slice(SALT_LENGTH + IV_LENGTH);

    const key = await getPasswordKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: ALGO, iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch {
    throw new Error('Invalid password or corrupted data');
  }
}
