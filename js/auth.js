import { CONFIG } from './config.js';

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function cacheUser(user) {
  const normalized = { ...user, college_email: user.college_email || user.email };
  localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(normalized));
  return normalized;
}

export const AuthService = {
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER) || 'null'); }
    catch { return null; }
  },
  async login(email, password) {
    const { user } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    return cacheUser(user);
  },
  async register(details) {
    const { user } = await api('/auth/register', { method: 'POST', body: JSON.stringify(details) });
    return cacheUser(user);
  },
  async refreshCurrentUser() {
    try {
      const { user } = await api('/auth/me');
      return cacheUser(user);
    } catch (error) {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
      return null;
    }
  },
  async logout() {
    try { await api('/auth/logout', { method: 'POST', body: '{}' }); }
    finally {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
      window.location.href = 'login.html';
    }
  },
  requireAuth() {
    const user = this.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    return user;
  },
  updateProfile(updates) {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...updates };
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  }
};

export async function apiRequest(path, options) { return api(path, options); }
