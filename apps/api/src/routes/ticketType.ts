import { Router } from "express";
import * as ticketTypeController from "../controllers/ticketTypeController";

const router = Router({ mergeParams: true });

router.post("/", ticketTypeController.createTicketType);
router.get("/", ticketTypeController.listTicketTypes);
router.get("/:ticketTypeId", ticketTypeController.getTicketType);
router.patch("/:ticketTypeId", ticketTypeController.updateTicketType);
router.delete("/:ticketTypeId", ticketTypeController.deleteTicketType);

export default router;
