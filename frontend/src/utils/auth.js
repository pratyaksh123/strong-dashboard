// src/utils/auth.js

export const saveTokens = (accessToken, refreshToken) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
};

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};
