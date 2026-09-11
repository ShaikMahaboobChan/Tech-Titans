/**
 * Cryptographic utility functions for VisionTrust
 * Uses standard Web Crypto API (SubtleCrypto) for SHA-256 verification
 */

export async function computeSha256(input: string | ArrayBuffer | Uint8Array): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    let buffer: ArrayBuffer;
    if (typeof input === 'string') {
      const encoder = new TextEncoder();
      buffer = encoder.encode(input).buffer as ArrayBuffer;
    } else if (input instanceof Uint8Array) {
      buffer = input.buffer as ArrayBuffer;
    } else {
      buffer = input;
    }

    const digest = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  return fallbackSha256(typeof input === 'string' ? input : new TextDecoder().decode(input));
}

/**
 * Deterministic software SHA-256 implementation as fallback
 */
function fallbackSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const maxWord = Math.pow(2, 32);
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let strWithPadding = ascii + '\x80';
  while (strWithPadding.length % 64 !== 56) {
    strWithPadding += '\x00';
  }

  for (let i = 0; i < strWithPadding.length; i++) {
    const code = strWithPadding.charCodeAt(i);
    const wordIdx = i >> 2;
    words[wordIdx] = (words[wordIdx] || 0) | (code << ((3 - (i % 4)) * 8));
  }

  const wordsLen = words.length;
  words[wordsLen] = (asciiBitLength / maxWord) | 0;
  words[wordsLen + 1] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = [...hash];

    for (let i = 0; i < 64; i++) {
      if (i >= 16) {
        const w15 = w[i - 15] || 0;
        const w2 = w[i - 2] || 0;
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] = ((w[i - 16] || 0) + s0 + (w[i - 7] || 0) + s1) | 0;
      }

      const s1h = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1h + ch + k[i] + (w[i] || 0)) | 0;
      const s0h = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0h + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const byte = (hash[i] >> (j * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

/**
 * Format cryptographic hash with shortened notation for high-density defense views
 * e.g., 9f8a7c2e...a82d
 */
export function formatShortHash(hash: string, lead = 8, trail = 6): string {
  if (!hash) return '';
  if (hash.length <= lead + trail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}

/**
 * Calculate linked SHA-256 block hash for the tamper-evident audit ledger
 */
export async function computeAuditBlockHash(
  blockIndex: number,
  timestamp: string,
  event: string,
  artifactId: string,
  prevHash: string
): Promise<string> {
  const payload = `BLOCK:${blockIndex}|TIME:${timestamp}|EVENT:${event}|ART:${artifactId}|PREV:${prevHash}`;
  return computeSha256(payload);
}
