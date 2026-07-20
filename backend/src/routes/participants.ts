import { Router } from "express";
import { z } from "zod";
import { PrismaClient, FormFieldType, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

const formResponseInputSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
});

function isAnswerFilled(value: unknown, type: FormFieldType): boolean {
  if (type === "CHECKBOX") return value === true;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}

// POST /api/participants/:id/form-response – öffentlich, sammelt die
// Antworten der Schritte 2–5 in einem Datensatz pro Anmeldung.
router.post("/:id/form-response", async (req, res) => {
  const parsed = formResponseInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const participant = await prisma.participant.findUnique({ where: { id: req.params.id } });
  if (!participant) {
    return res.status(404).json({ error: "Anmeldung nicht gefunden" });
  }

  const template = await prisma.formTemplate.findFirst({
    where: { campId: participant.campId, isActive: true },
    include: { fields: true },
  });
  if (!template) {
    return res.status(404).json({ error: "Kein Formular für dieses Camp konfiguriert" });
  }

  const missingFields = template.fields
    .filter((field) => field.required && !isAnswerFilled(parsed.data.answers[field.key], field.type))
    .map((field) => field.key);
  if (missingFields.length > 0) {
    return res.status(400).json({ error: "Pflichtfelder fehlen", fields: missingFields });
  }

  // Nur bekannte Feld-Keys übernehmen, keine beliebigen Zusatzdaten speichern.
  const knownKeys = new Set(template.fields.map((field) => field.key));
  const filteredAnswers = Object.fromEntries(
    Object.entries(parsed.data.answers).filter(([key]) => knownKeys.has(key))
  ) as Prisma.InputJsonValue;

  const formResponse = await prisma.formResponse.upsert({
    where: { participantId: participant.id },
    update: { formTemplateId: template.id, answers: filteredAnswers },
    create: { participantId: participant.id, formTemplateId: template.id, answers: filteredAnswers },
  });

  await prisma.auditLog.create({
    data: {
      action: "FORM_RESPONSE_SUBMITTED",
      entityType: "Participant",
      entityId: participant.id,
      metadata: { formTemplateId: template.id },
    },
  });

  res.status(201).json({
    id: formResponse.id,
    participantId: formResponse.participantId,
    submittedAt: formResponse.submittedAt,
  });
});

export default router;
