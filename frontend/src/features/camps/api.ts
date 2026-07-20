import { apiFetch } from "../../lib/api";
import type { CampFormValues } from "./schema";

export interface Camp {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  maxParticipants: number | null;
  participantCount: number;
}

export function fetchCamps(token: string) {
  return apiFetch<Camp[]>("/camps", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createCamp(token: string, values: CampFormValues) {
  return apiFetch<Camp>("/camps", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(values),
  });
}
