import { Router } from "express";
import * as controller from "src/controllers/assistanceController";
import { userAuthenticated } from "src/middleware/authMiddleware";
import { verifyIfUserHasPermission, allowedSearchField } from 'src/middleware/permissionMiddleware';

const router = Router();
router.delete("/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.deleteById);
router.patch("/disable/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.disableById);
router.patch("/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.update);
router.post("/subscribe/:assistanceId", userAuthenticated, controller.subscribeUser);
router.get("/subscribers/:assistanceId", userAuthenticated, allowedSearchField, controller.getSubscribers);
router.patch("/unsubscribe/:assistanceId", userAuthenticated, controller.unsubscribeUser);
router.get("/search", allowedSearchField, controller.searchQuery);
//TODO: Document thus route
router.patch("/confirm-presence/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.assistanceGivePresence);

router.post("/", userAuthenticated, controller.create);
router.get("/", allowedSearchField, controller.getAll);

export default router;