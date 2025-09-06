import axios from 'axios';
import { getAccessToken } from '../utils/token.utils';

const API_BASE = 'http://localhost:4000';

const apiClientAxios = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClientAxios.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClientAxios;
