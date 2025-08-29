import axios from "axios";

export const api = axios.create({
  baseURL: "https://back-telemetria-tg.onrender.com",
  timeout: 50000,
});

api.interceptors.request.use(async (config) => {
  config.headers["Content-Type"] = "application/json";
  config.headers.Accept = "application/json";

  console.log(
    `[${config.method?.toUpperCase()}]: ` + config.baseURL + config.url
  );
  return config;
});
