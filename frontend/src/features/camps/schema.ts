import { z } from "zod";

export const campFormSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich").max(150),
  startDate: z.string().min(1, "Startdatum ist erforderlich"),
  endDate: z.string().min(1, "Enddatum ist erforderlich"),
  maxParticipants: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number().int().positive().optional()
  ),
});

export type CampFormValues = z.infer<typeof campFormSchema>;
