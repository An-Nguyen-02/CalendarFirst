import { Router } from "express";
import * as integrationsController from "../controllers/integrationsController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/google", requireAuth, integrationsController.getGoogle);

export default router;