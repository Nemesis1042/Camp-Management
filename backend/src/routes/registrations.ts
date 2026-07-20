import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// Schritt 1 des Anmeldeformulars: Grunddaten. Nutzt die bestehenden
// Participant-Spalten, da diese sich campübergreifend nicht ändern
// (im Gegensatz zu Gesundheit/Aktivitäten/Einwilligungen, die später
// über ein dynamisches Formular-Feld-System abgebildet werden).
const registrationSchema = z.object({
  campId: z.string().uuid(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  birthDate: z.coerce.date(),
  gender: z.string().trim().max(50).optional(),
  address: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(50).optional(),
});

// POST /registrations – öffentlich, keine Anmeldung nötig (Eltern füllen
// das Formular ohne Account aus, analog zum Papier-Freizeitpass).
router.post("/", async (req, res) => {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { campId, ...participantData } = parsed.data;

  const camp = await prisma.camp.findUnique({
    where: { id: campId },
    select: { id: true, maxParticipants: true, _count: { select: { participants: true } } },
  });
  if (!camp) {
    return res.status(404).json({ error: "Camp nicht gefunden" });
  }
  if (camp.maxParticipants !== null && camp._count.participants >= camp.maxParticipants) {
    return res.status(409).json({ error: "Camp ist bereits ausgebucht" });
  }

  const participant = await prisma.participant.create({
    data: { campId, ...participantData },
  });

  await prisma.auditLog.create({
    data: {
      action: "PARTICIPANT_REGISTERED",
      entityType: "Participant",
      entityId: participant.id,
      metadata: { campId },
    },
  });

  res.status(201).json({
    id: participant.id,
    campId: participant.campId,
    firstName: participant.firstName,
    lastName: participant.lastName,
    createdAt: participant.createdAt,
  });
});

export default router;
