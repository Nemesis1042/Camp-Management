import { z } from "zod";
import type { FormFieldDef } from "./formTemplateApi";

export function buildStepSchema(fields: FormFieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.key] = fieldToZod(field);
  }
  return z.object(shape);
}

function fieldToZod(field: FormFieldDef): z.ZodTypeAny {
  if (field.type === "CHECKBOX") {
    return field.required
      ? z.literal(true, { errorMap: () => ({ message: "Bitte bestätigen" }) })
      : z.boolean().optional();
  }

  if (field.type === "NUMBER") {
    const base = z.coerce.number({ invalid_type_error: "Bitte eine Zahl eingeben" });
    return field.required ? base : base.optional();
  }

  if (field.type === "EMAIL") {
    const base = z.string().trim().email("Bitte eine gültige E-Mail-Adresse eingeben");
    return field.required ? base : z.union([base, z.literal("")]);
  }

  const base = z.string().trim();
  return field.required ? base.min(1, "Erforderlich") : z.union([base, z.literal("")]);
}
