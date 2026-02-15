import { Org, OrgRole } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
}

declare global {
    namespace Express {
      interface Request {
        user?: JwtPayload;
        org?: Org;
        orgRole?: OrgRole;
      }
    }
  }
  
export {};