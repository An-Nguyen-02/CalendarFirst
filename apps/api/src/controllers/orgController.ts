import { Request, Response } from "express";
import { createOrgSchema } from "../schemas/org";
import { createOrg, getUserOrgs } from "../services/orgService";

export async function createOrgHandler(req: Request, res: Response) {
  const parsed = createOrgSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await createOrg(userId, parsed.data);
  res.status(201).json(org);
}

export async function getOrg(req: Request, res: Response) {
    res.status(200).json(req.org);
}

export async function listOrgs(req: Request, res: Response) {
    const orgs = await getUserOrgs(req.user?.sub ?? "");
    res.status(200).json({orgs: orgs.map(m => ({ id: m.org.id, name: m.org.name, role: m.role }))});
}