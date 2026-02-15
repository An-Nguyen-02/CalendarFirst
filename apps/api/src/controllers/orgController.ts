import { Request, Response } from "express";
import { getUserOrgs } from "../services/orgService";

export async function getOrg(req: Request, res: Response) {
    res.status(200).json(req.org);
}

export async function listOrgs(req: Request, res: Response) {
    const orgs = await getUserOrgs(req.user?.sub ?? "");
    res.status(200).json({orgs: orgs.map(m => ({ id: m.org.id, name: m.org.name, role: m.role }))});
}