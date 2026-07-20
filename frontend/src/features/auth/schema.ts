import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().trim().email("Bitte eine gültige E-Mail-Adresse eingeben"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
