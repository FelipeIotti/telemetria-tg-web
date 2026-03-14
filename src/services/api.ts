import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 50000,
});

api.interceptors.request.use(async (config) => {
  config.headers["Content-Type"] = "application/json";
  config.headers.Accept = "application/json";
  return config;
});
