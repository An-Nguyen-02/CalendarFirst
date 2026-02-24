import { Router } from "express";
import * as authController from "../controllers/authController";
import * as googleAuthController from "../controllers/googleAuthController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

router.get("/google/start", requireAuth, googleAuthController.start);
router.get("/google/callback", googleAuthController.callback);

export default router;
