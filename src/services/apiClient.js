import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import cryptoService from './cryptoService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// const API_KEY = import.meta.env.VITE_API_KEY || 'your-api-key-here';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.refreshPromise = null;
    this.requestQueue = [];
    this.isRefreshing = false;

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        if (config.headers['X-API-Key']) {
          const apiKey = await cryptoService.generateXAPIKey();
          config.headers['X-API-Key'] = apiKey;
          return config;
        }
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.requestQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              this.processQueue(null, newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.clearAuth();
            window.location.href = '/login';
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  processQueue(error, token = null) {
    this.requestQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
        resolve(this.client(config));
      }
    });
    this.requestQueue = [];
  }

  async getToken() {
    try {
      const authData = await cryptoService.retrieveSecurely('auth_token', 'user_session');
      return authData?.token || null;
    } catch (error) {
      return null;
    }
  }

  async setToken(token, rememberMe = false) {

      const authData = { token, timestamp: Date.now() };
      const storageKey = 'auth_token';
      const password = 'user_session';

      if (rememberMe) {
        // Store in localStorage for persistent sessions
        const encrypted = await cryptoService.encrypt(authData, password);
        localStorage.setItem(storageKey, encrypted);
      } else {
        // Store in sessionStorage for session-only
        await cryptoService.storeSecurely(storageKey, authData, password);
      }
      
      this.scheduleTokenRefresh(token);

  }

  async clearAuth() {
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token');
      this.cancelTokenRefresh();
  }

  isTokenExpired(token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      // Check if token expires within 5 minutes (300 seconds)
      return decoded.exp <= (currentTime + 300);
    } catch (error) {
      return true;
    }
  }

  scheduleTokenRefresh(token) {
      const decoded = jwtDecode(token);
      const expiry = decoded.exp + 3600000;
      const timeUntilRefresh = expiry - Date.now() + 330000;

      if (timeUntilRefresh > 0) {
        this.refreshTimeout = setTimeout(() => {
          this.refreshToken();
        }, timeUntilRefresh);
      }
  }

  cancelTokenRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  async refreshToken() {
      const response = await this.client.post('/refresh');
      const { token } = response.data;
      
      await this.setToken(token);
      this.scheduleTokenRefresh(token);
      
      return token;
  }

  // Exponential backoff retry mechanism
  async requestWithRetry(config, maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await this.client(config);
      } catch (error) {
        retries++;
        
        if (retries === maxRetries || error.response?.status < 500) {
          throw error;
        }
        
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // API Methods
  async login(credentials) {
    const response = await this.client.post('/login', credentials, {
      headers: { 'X-API-Key': true }});
    return response.data;
  }

  async logout() {
      await this.clearAuth();
  }

  async getProfile() {
    const response = await this.client.get('/profile');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await this.client.post('/profile', profileData);
    return response.data;
  }

  async setup2FA(token) {
    const response = await this.client.post('/2fa/enable', { token });
    return response.data;
  }

  async verify2FA(credentials) {
    const response = await this.client.post('/2fa/verify', credentials);
    return response.data;
  }

  async disable2FA(token) {
    const response = await this.client.post('/2fa/disable', { token });
    return response.data;
  }

  async resetPassword(email) {
    const response = await this.client.post('/recover', { email }, {
      headers: { 'X-API-Key': true }});
    return response.data;
  }

  async confirmPasswordReset(token, newPassword) {
    const response = await this.client.post('/recover/confirm', {
      token,
      newPassword
    }, {
      headers: { 'X-API-Key': true }});
    return response.data;
  }

  // Admin endpoints
  async getUsers() {
    const response = await this.client.get(`/users`);
    return response.data;
  }

  async updateUserRole(userId, role) {
    const response = await this.client.post(`/users/${userId}/role`, { role });
    return response.data;
  }

  async createUser(userData) {
    const response = await this.client.post('/users', userData);
    return response.data;
  }

  async toggleUserEnabled(userId) {
    const response = await this.client.post(`/users/${userId}/enabled`);
    return response.data;
  }

  // Service credentials management
  async getServiceCredentialsById(userId) {
    const response = await this.client.get(`/users/${userId}/credentials`);
    return response.data;
  }

  async updateServiceCredentialsById(userId, credentialData) {
    const response = await this.client.put(`/users/${userId}/credentials`, credentialData);
    return response.data;
  }
}

export default new ApiClient();
