"use client";

import Axios from "axios";

const axiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("@Auth:token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = error?.config?.url || "";
    const isAuthEndpoint =
      url.includes("auth/login") || url.includes("auth/validate-token");

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("@Auth:token")
        : null;

    // Dispara session-expired apenas se havia um token de sessão salvo no navegador
    if (token && !isAuthEndpoint) {
      localStorage.clear();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("session-expired"));
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
