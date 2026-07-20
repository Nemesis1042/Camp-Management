import { z } from "zod";

// Leere Strings aus optionalen Textfeldern werden zu undefined, damit sie
// beim Backend-Zod-Schema als "nicht angegeben" statt als leerer String
// ankommen (dort ebenfalls optional).
const optionalField = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional()
  );

export const registrationFormSchema = z.object({
  firstName: z.string().trim().min(1, "Vorname ist erforderlich").max(100),
  lastName: z.string().trim().min(1, "Nachname ist erforderlich").max(100),
  birthDate: z.string().min(1, "Geburtsdatum ist erforderlich"),
  gender: optionalField(50),
  address: optionalField(255),
  phone: optionalField(50),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;
