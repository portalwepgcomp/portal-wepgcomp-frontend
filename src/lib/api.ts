"use client";

import Axios from "axios";

/**
 * Encerra a sessão e avisa o AuthProvider. Só age se havia um token salvo: um
 * 401 de visitante não é sessão expirada.
 */
export function encerrarSessaoExpirada() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("@Auth:token")) return;

  localStorage.clear();
  window.dispatchEvent(new CustomEvent("session-expired"));
}

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

    if (!isAuthEndpoint) {
      encerrarSessaoExpirada();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
