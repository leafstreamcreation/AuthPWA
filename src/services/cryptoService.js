/**
 * Client-side encryption service using Web Crypto API
 * Provides AES-GCM encryption for secure credential storage
 */

class CryptoService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12; // 96 bits for GCM
    this.saltLength = 16;
    this.iterations = 100000; // PBKDF2 iterations
  }

  /**
   * Generate a cryptographically secure random salt
   */
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(this.saltLength));
  }

  /**
   * Generate a random IV for AES-GCM
   */
  generateIV() {
    return crypto.getRandomValues(new Uint8Array(this.ivLength));
  }

  /**
   * Derive a key from a password using PBKDF2
   */
  async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   */
  async encrypt(data, password) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      
      const salt = this.generateSalt();
      const iv = this.generateIV();
      const key = await this.deriveKey(password, salt);

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        dataBuffer
      );

      // Combine salt, iv, and encrypted data
      const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(new Uint8Array(encryptedData), salt.length + iv.length);

      return btoa(String.fromCharCode(...result));
    } catch (error) {
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  async decrypt(encryptedData, password) {
    try {
      const dataBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      const salt = dataBuffer.slice(0, this.saltLength);
      const iv = dataBuffer.slice(this.saltLength, this.saltLength + this.ivLength);
      const encrypted = dataBuffer.slice(this.saltLength + this.ivLength);

      const key = await this.deriveKey(password, salt);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decryptedData));
    } catch (error) {
      throw new Error('Failed to decrypt data - invalid password or corrupted data');
    }
  }

  /**
   * Securely store encrypted data in sessionStorage
   */
  async storeSecurely(key, data, password) {
    try {
      const encrypted = await this.encrypt(data, password);
      sessionStorage.setItem(key, encrypted);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retrieve and decrypt data from sessionStorage
   */
  async retrieveSecurely(key, password) {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      
      return await this.decrypt(encrypted, password);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate a secure random string for passwords
   */
  generateSecureString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => chars[byte % chars.length]).join('');
  }

  /**
   * Hash a string using SHA-256
   */
  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clear all secure storage
   */
  clearSecureStorage() {
    sessionStorage.clear();
  }

  async generateXAPIKey() {
    const iv = crypto.getRandomValues(new Uint8Array(parseInt(import.meta.env.VITE_AES_IV_LENGTH || "12")));
    const salt = crypto.getRandomValues(new Uint8Array(parseInt(import.meta.env.VITE_PBKDF2_SALT_LENGTH || "16")));

    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(import.meta.env.VITE_API_SECRET || ""),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: parseInt(import.meta.env.VITE_PBKDF2_ITERATIONS || "100000"),
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    const encrypted = await crypto.subtle.encrypt(
      { 
        name: "AES-GCM", 
        iv,
        tagLength: parseInt(import.meta.env.VITE_AES_TAG_LENGTH || "128")
      },
      derivedKey,
      new TextEncoder().encode(import.meta.env.VITE_API_CIPHER || "")
    );
    const fullKey = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
    fullKey.set(new Uint8Array(encrypted), 0);
    fullKey.set(iv, encrypted.byteLength);
    fullKey.set(salt, encrypted.byteLength + iv.byteLength);
    let binary = '';
      for (let i = 0; i < fullKey.byteLength; i++) {
        binary += String.fromCharCode(fullKey[i]);
      }

      const apiKeyEncryptedBase64 = window.btoa(binary);
      return apiKeyEncryptedBase64;
    }
}

export default new CryptoService();
