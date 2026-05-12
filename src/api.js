import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://school-erp.m.frappe.cloud';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// POST-based RPC for Frappe whitelisted methods
export const callApi = async (method, args = {}) => {
  const res = await api.post(`/api/method/${method}`, args);
  return res.data;
};

// GET-based API
export const getApi = async (path) => {
  const res = await api.get(`/api/${path}`);
  return res.data;
};
