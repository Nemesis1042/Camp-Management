import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Erststart-Zugang für die lokale Entwicklung. Für Produktivbetrieb per
// SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD überschreiben.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cvjm-dobelmuehle.de";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "changeme123";

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "CVJM Dobelmühle",
    },
  });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: UserRole.MASTER_ADMIN,
    },
  });

  console.log(`Organisation bereit: ${organization.name}`);
  console.log(`Master-Admin bereit: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Seed fehlgeschlagen:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
