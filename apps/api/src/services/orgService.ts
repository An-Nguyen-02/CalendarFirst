import { prisma } from "../lib/prisma";


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
