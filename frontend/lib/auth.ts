"use client";

// Simple auth utilities using localStorage for the interview demonstration
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const finalUrl = url.replace('http://localhost:8000', API_URL);

  const token = getToken();
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // If sending JSON and no Content-Type is set, add it
  if (options.body && typeof options.body === 'string' && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Optional: handle token expiration globally
    removeToken();
    if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
      window.location.href = "/login";
    }
  }

  return response;
};
