import { Router } from "express";
import { OrgRole } from "@prisma/client";
import * as eventController from "../controllers/eventController";
import { requireAuth } from "../middleware/auth";
import { requireOrgMembership, requireOrgRole } from "../middleware/org";

const organizerEventRouter = Router({ mergeParams: true });

organizerEventRouter.use(requireAuth, requireOrgMembership, requireOrgRole([OrgRole.ORGANIZER, OrgRole.ADMIN]));

organizerEventRouter.post("/", eventController.createEvent);
organizerEventRouter.get("/", eventController.listOrgEvents);
organizerEventRouter.get("/:eventId", eventController.getOrgEvent);
organizerEventRouter.patch("/:eventId", eventController.updateEvent);
organizerEventRouter.delete("/:eventId", eventController.deleteEvent);

export { organizerEventRouter };

const publicEventRouter = Router();

publicEventRouter.get("/", eventController.listPublicEvents);
publicEventRouter.get("/:eventId", eventController.getPublicEvent);

export { publicEventRouter };
