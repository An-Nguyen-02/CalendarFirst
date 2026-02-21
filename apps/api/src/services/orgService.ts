import { OrgRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateOrgInput } from "../schemas/org";

export async function createOrg(userId: string, input: CreateOrgInput) {
  const org = await prisma.org.create({
    data: {
      name: input.name,
      ownerUserId: userId,
    },
  });
  await prisma.orgMember.create({
    data: {
      orgId: org.id,
      userId,
      role: OrgRole.ADMIN,
    },
  });
  return org;
}

export async function getUserOrgMembership(userId: string, orgId: string) {
  return await prisma.orgMember.findFirst({
    where: {
      orgId,
      userId,
    },
    include: { org: true },
  });
}

export async function getUserOrgs(userId: string) {
  return await prisma.orgMember.findMany({
    where: { userId },
    include: { org: true },
  });
}
