import { Org, OrgRole, UserRole } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
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