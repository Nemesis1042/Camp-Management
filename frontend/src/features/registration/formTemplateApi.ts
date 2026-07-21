import { apiFetch } from "../../lib/api";

export type FormFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "DATE"
  | "NUMBER"
  | "EMAIL"
  | "PHONE"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX";

export interface FormFieldDef {
  id: string;
  step: number;
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options: string[] | null;
  order: number;
}

export interface FormTemplateResponse {
  id: string;
  version: number;
  fields: FormFieldDef[];
}

export interface FormFieldInput {
  step: number;
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  order: number;
}

export function fetchFormTemplate(campId: string) {
  return apiFetch<FormTemplateResponse>(`/camps/${campId}/form-template`);
}

export function publishFormTemplate(campId: string, token: string, fields: FormFieldInput[]) {
  return apiFetch<FormTemplateResponse>(`/camps/${campId}/form-template`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fields }),
  });
}

export function submitFormResponse(participantId: string, answers: Record<string, unknown>) {
  return apiFetch<{ id: string; participantId: string; submittedAt: string }>(
    `/participants/${participantId}/form-response`,
    {
      method: "POST",
      body: JSON.stringify({ answers }),
    }
  );
}
