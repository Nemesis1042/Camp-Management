import { useState } from "react";

const STORAGE_KEY = "camp-management-admin-token";

export function useAdminToken() {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  function setToken(value: string) {
    localStorage.setItem(STORAGE_KEY, value);
    setTokenState(value);
  }

  function clearToken() {
    localStorage.removeItem(STORAGE_KEY);
    setTokenState(null);
  }

  return { token, setToken, clearToken };
}
