import { Router, Response } from "express";
import { z } from "zod";
import { PrismaClient, UserRole, FormFieldType } from "@prisma/client";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { DEFAULT_FORM_FIELDS } from "../lib/defaultFormFields";

const prisma = new PrismaClient();
const router = Router();

const campInputSchema = z.object({
  name: z.string().trim().min(1).max(150),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  maxParticipants: z.coerce.number().int().positive().optional(),
});

// Schritt 1 (Grunddaten) ist fest, daher decken Formularfelder nur die
// Schritte 2–5 ab.
const formFieldInputSchema = z.object({
  step: z.number().int().min(2).max(5),
  key: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "Nur Buchstaben/Zahlen, muss mit einem Buchstaben beginnen"),
  label: z.string().trim().min(1).max(200),
  type: z.nativeEnum(FormFieldType),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1)).optional(),
  order: z.number().int(),
});

const formTemplateInputSchema = z.object({
  fields: z.array(formFieldInputSchema).min(1),
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
    data: {
      organizationId: organization.id,
      name,
      startDate,
      endDate,
      maxParticipants,
      formTemplates: {
        create: {
          version: 1,
          fields: { create: DEFAULT_FORM_FIELDS },
        },
      },
    },
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

// GET /api/camps/:campId/form-template – öffentlich, wird sowohl vom
// Anmeldeformular als auch von der Admin-Feldkonfiguration genutzt
router.get("/:campId/form-template", async (req, res) => {
  const template = await prisma.formTemplate.findFirst({
    where: { campId: req.params.campId, isActive: true },
    include: { fields: { orderBy: [{ step: "asc" }, { order: "asc" }] } },
  });
  if (!template) {
    return res.status(404).json({ error: "Kein Formular für dieses Camp konfiguriert" });
  }

  res.json({
    id: template.id,
    version: template.version,
    fields: template.fields.map((field) => ({
      id: field.id,
      step: field.step,
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options,
      order: field.order,
    })),
  });
});

// PUT /api/camps/:campId/form-template – neue Formular-Version veröffentlichen
// (MASTER_ADMIN). Bestehende FormResponses bleiben an ihre alte Version
// gebunden und somit unverändert lesbar.
router.put(
  "/:campId/form-template",
  requireAuth,
  requireRole(UserRole.MASTER_ADMIN),
  async (req: AuthedRequest, res: Response) => {
    const parsed = formTemplateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const keys = parsed.data.fields.map((field) => field.key);
    if (new Set(keys).size !== keys.length) {
      return res.status(400).json({ error: "Feld-Schlüssel müssen innerhalb eines Formulars eindeutig sein" });
    }

    const camp = await prisma.camp.findUnique({ where: { id: req.params.campId } });
    if (!camp) {
      return res.status(404).json({ error: "Camp nicht gefunden" });
    }

    const current = await prisma.formTemplate.findFirst({
      where: { campId: camp.id, isActive: true },
    });
    const nextVersion = (current?.version ?? 0) + 1;

    const template = await prisma.$transaction(async (tx) => {
      if (current) {
        await tx.formTemplate.update({ where: { id: current.id }, data: { isActive: false } });
      }
      return tx.formTemplate.create({
        data: {
          campId: camp.id,
          version: nextVersion,
          fields: { create: parsed.data.fields },
        },
        include: { fields: { orderBy: [{ step: "asc" }, { order: "asc" }] } },
      });
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.sub,
        action: "FORM_TEMPLATE_PUBLISHED",
        entityType: "FormTemplate",
        entityId: template.id,
        metadata: { campId: camp.id, version: template.version },
      },
    });

    res.status(201).json({
      id: template.id,
      version: template.version,
      fields: template.fields,
    });
  }
);

export default router;
