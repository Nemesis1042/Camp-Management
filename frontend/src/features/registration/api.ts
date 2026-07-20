import { apiFetch } from "../../lib/api";
import type { RegistrationFormValues } from "./schema";

interface CreateRegistrationInput extends RegistrationFormValues {
  campId: string;
}

interface RegistrationResponse {
  id: string;
  campId: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export function createRegistration(input: CreateRegistrationInput) {
  return apiFetch<RegistrationResponse>("/registrations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
