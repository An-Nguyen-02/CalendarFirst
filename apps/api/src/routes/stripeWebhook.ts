import { Router } from "express";
import * as stripeWebhookController from "../controllers/stripeWebhookController";

const router = Router();

router.post("/", stripeWebhookController.handleStripeWebhook);

export default router;
