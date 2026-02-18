import { Router } from "express";
import * as orderController from "../controllers/orderController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, orderController.listOrders);
router.get("/:orderId", requireAuth, orderController.getOrder);

export default router;
