import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@calsync.test" },
    update: {},
    create: {
      email: "demo@calsync.test",
      passwordHash,
    },
  });

  const org = await prisma.org.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Demo Org",
      ownerUserId: user.id,
    },
  });

  await prisma.orgMember.upsert({
    where: {
      orgId_userId: { orgId: org.id, userId: user.id },
    },
    update: {},
    create: {
      orgId: org.id,
      userId: user.id,
      role: "ORGANIZER",
    },
  });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.event.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      orgId: org.id,
      title: "Demo Meetup",
      description: "A sample event for local development.",
      startAt: tomorrow,
      endAt: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
      venue: "Conference Room A",
      status: "PUBLISHED",
      capacity: 50,
    },
  });

  await prisma.event.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      orgId: org.id,
      title: "Tech Talk",
      description: "Monthly tech discussion.",
      startAt: nextWeek,
      endAt: new Date(nextWeek.getTime() + 90 * 60 * 1000),
      venue: "Online",
      status: "DRAFT",
      capacity: 100,
    },
  });

  console.log("Seeded: demo user (demo@calsync.test / demo123), org, and 2 events.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
