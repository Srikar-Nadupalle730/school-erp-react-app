import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://school-erp.m.frappe.cloud';

const API_KEY = import.meta.env.VITE_API_KEY;
const API_SECRET = import.meta.env.VITE_API_SECRET;

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `token ${API_KEY}:${API_SECRET}`,
  },
});

export const callApi = async (method, args = {}) => {
  const res = await api.post(
    `/api/method/${method}`,
    args
  );

  return res.data.message;
};

export const getApi = async (path) => {
  const res = await api.get(`/api/${path}`);

  return res.data.message || res.data;
};
