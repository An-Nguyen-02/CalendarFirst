import { Request, Response, NextFunction } from "express";
import { getUserOrgMembership  } from "../services/orgService";
import { OrgRole } from "@prisma/client";

export async function requireOrgMembership(req: Request, res: Response, next: NextFunction) {
    const { orgId } = req.params;
    const { user } = req;
  
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    
    if (!orgId) {
      res.status(400).json({ error: "Organization ID is required" });
      return;
    }
  
    const membership = await getUserOrgMembership(user.sub, orgId);
    if (!membership) {
      res.status(403).json({ error: "You are not a member of this organization" });
      return;
    }
  
    req.org = membership.org;
    req.orgRole = membership.role as OrgRole;
    next();
  }
  
  export function requireOrgRole(allowedRoles: OrgRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.orgRole || !allowedRoles.includes(req.orgRole)) {
        res.status(403).json({ error: "You are not authorized to access this resource" });
        return;
      }
      next();
    };
  }