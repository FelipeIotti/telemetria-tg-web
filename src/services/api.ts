import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 50000,
});

api.interceptors.request.use(async (config) => {
  const requestId = Math.random().toString(36).substring(7);
  config.headers["X-Request-ID"] = requestId;
  config.headers["Content-Type"] = "application/json";
  config.headers.Accept = "application/json";

  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} [ID: ${requestId}]`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    const requestId = response.config.headers["X-Request-ID"];
    console.log(`[API] Response ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} [ID: ${requestId}]`);
    return response;
  },
  (error: AxiosError) => {
    const requestId = error.config?.headers["X-Request-ID"];

    if (error.response) {
      console.error(`[API] Error ${error.response.status} ${error.response.config?.method?.toUpperCase()} ${error.response.config?.url} [ID: ${requestId}]`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error(`[API] Network Error - ${error.config?.method?.toUpperCase()} ${error.config?.url} [ID: ${requestId}]`, {
        message: "Não foi possível receber resposta do servidor",
        url: error.config?.url,
      });
    } else {
      console.error(`[API] Error [ID: ${requestId}]`, error.message);
    }

    return Promise.reject(error);
  }
);
