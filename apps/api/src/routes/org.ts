import { Router } from "express";
import { UserRole } from "@prisma/client";
import * as orgController from "../controllers/orgController";
import { requireAuth, requireUserRole } from "../middleware/auth";
import { requireOrgMembership } from "../middleware/org";
import { organizerEventRouter } from "./event";

const router = Router();

router.get("/", requireAuth, orgController.listOrgs);
router.post("/", requireAuth, requireUserRole([UserRole.ORGANIZER]), orgController.createOrgHandler);
router.get("/:orgId", requireAuth, requireOrgMembership, orgController.getOrg);
router.use("/:orgId/events", organizerEventRouter);

export default router;