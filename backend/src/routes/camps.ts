import { Router, Response } from "express";
import { z } from "zod";
import { PrismaClient, UserRole } from "@prisma/client";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

const campInputSchema = z.object({
  name: z.string().trim().min(1).max(150),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  maxParticipants: z.coerce.number().int().positive().optional(),
});

function isValidDateRange(startDate: Date, endDate: Date) {
  return endDate.getTime() >= startDate.getTime();
}

// GET /api/camps – Übersicht für Admin-/Betreuer-Rollen (nicht für Eltern)
router.get(
  "/",
  requireAuth,
  requireRole(UserRole.MASTER_ADMIN, UserRole.CAMP_ADMIN, UserRole.STAFF),
  async (_req: AuthedRequest, res: Response) => {
    const camps = await prisma.camp.findMany({
      orderBy: { startDate: "asc" },
      include: { _count: { select: { participants: true } } },
    });

    res.json(
      camps.map((camp) => ({
        id: camp.id,
        name: camp.name,
        startDate: camp.startDate,
        endDate: camp.endDate,
        maxParticipants: camp.maxParticipants,
        participantCount: camp._count.participants,
      }))
    );
  }
);

// POST /api/camps – neues Camp anlegen
router.post("/", requireAuth, requireRole(UserRole.MASTER_ADMIN), async (req: AuthedRequest, res: Response) => {
  const parsed = campInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, startDate, endDate, maxParticipants } = parsed.data;
  if (!isValidDateRange(startDate, endDate)) {
    return res.status(400).json({ error: "Enddatum muss nach dem Startdatum liegen" });
  }

  const organization = await prisma.organization.findFirst();
  if (!organization) {
    return res.status(500).json({ error: "Keine Organisation konfiguriert" });
  }

  const camp = await prisma.camp.create({
    data: { organizationId: organization.id, name, startDate, endDate, maxParticipants },
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.user!.sub,
      action: "CAMP_CREATED",
      entityType: "Camp",
      entityId: camp.id,
      metadata: { name: camp.name },
    },
  });

  res.status(201).json(camp);
});

// PATCH /api/camps/:id – Camp bearbeiten
router.patch("/:id", requireAuth, requireRole(UserRole.MASTER_ADMIN), async (req: AuthedRequest, res: Response) => {
  const parsed = campInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.camp.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: "Camp nicht gefunden" });
  }

  const nextStartDate = parsed.data.startDate ?? existing.startDate;
  const nextEndDate = parsed.data.endDate ?? existing.endDate;
  if (!isValidDateRange(nextStartDate, nextEndDate)) {
    return res.status(400).json({ error: "Enddatum muss nach dem Startdatum liegen" });
  }

  const camp = await prisma.camp.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.user!.sub,
      action: "CAMP_UPDATED",
      entityType: "Camp",
      entityId: camp.id,
      metadata: { changedFields: Object.keys(parsed.data) },
    },
  });

  res.json(camp);
});

export default router;
