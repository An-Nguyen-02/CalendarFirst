import { Router } from "express";
import * as orgController from "../controllers/orgController";
import { requireAuth } from "../middleware/auth";
import { requireOrgMembership } from "../middleware/org";
import { organizerEventRouter } from "./event";

const router = Router();

router.get("/", requireAuth, orgController.listOrgs);
router.get("/:orgId", requireAuth, requireOrgMembership, orgController.getOrg);
router.use("/:orgId/events", organizerEventRouter);

export default router;