import { apiFetch } from "../../lib/api";
import type { LoginFormValues } from "./schema";

interface LoginResponse {
  token: string;
}

export function login(values: LoginFormValues) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
}
