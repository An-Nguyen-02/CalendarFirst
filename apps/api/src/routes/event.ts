import { Router } from "express";
import { OrgRole } from "@prisma/client";
import * as eventController from "../controllers/eventController";
import * as orderController from "../controllers/orderController";
import * as ticketTypeController from "../controllers/ticketTypeController";
import { requireAuth } from "../middleware/auth";
import { requireOrgMembership, requireOrgRole } from "../middleware/org";
import ticketTypeRoutes from "./ticketType";

const organizerEventRouter = Router({ mergeParams: true });

organizerEventRouter.use(requireAuth, requireOrgMembership, requireOrgRole([OrgRole.ORGANIZER, OrgRole.ADMIN]));

organizerEventRouter.post("/", eventController.createEvent);
organizerEventRouter.get("/", eventController.listOrgEvents);
organizerEventRouter.get("/:eventId/orders", orderController.listEventOrders);
organizerEventRouter.get("/:eventId", eventController.getOrgEvent);
organizerEventRouter.patch("/:eventId", eventController.updateEvent);
organizerEventRouter.delete("/:eventId", eventController.deleteEvent);
organizerEventRouter.use("/:eventId/ticket-types", ticketTypeRoutes);

export { organizerEventRouter };

const publicEventRouter = Router();

publicEventRouter.get("/", eventController.listPublicEvents);
publicEventRouter.get("/:eventId/ticket-types", ticketTypeController.listPublicTicketTypes);
publicEventRouter.post("/:eventId/orders", requireAuth, orderController.createOrder);
publicEventRouter.get("/:eventId", eventController.getPublicEvent);

export { publicEventRouter };
