import { Router } from "express";
import * as orgController from "../controllers/orgController";
import { requireAuth } from "../middleware/auth";
import { requireOrgMembership } from "../middleware/org";

const router = Router();

router.get("/:orgId", requireAuth, requireOrgMembership, orgController.getOrg);
router.get("/", requireAuth, orgController.listOrgs);