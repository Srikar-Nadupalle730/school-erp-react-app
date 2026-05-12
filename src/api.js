import axios from 'axios';

// Use VITE_API_URL env var for Vercel / production, fallback to local Frappe dev server
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
});

// POST-based RPC for Frappe whitelisted methods
export const callApi = async (method, args = {}) => {
  const res = await api.post(`method/${method}`, args);
  return res.data.message;
};

// GET-based for simple reads (resource API)
export const getApi = async (path) => {
  const res = await api.get(path);
  return res.data;
};
