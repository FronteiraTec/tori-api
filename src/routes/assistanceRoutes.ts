import { Router } from "express";
import * as controller from "src/controllers/assistanceController";
import { userAuthenticated } from "src/middleware/authMiddleware";
import { verifyIfUserHasPermission, allowedSearchField } from 'src/middleware/permissionMiddleware';

const assistanceRouter: Router = Router();

//TODO: get latitude and longitude from cep
assistanceRouter.delete("/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.deleteById);
assistanceRouter.patch("/disable/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.disableById);
assistanceRouter.patch("/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.update);
assistanceRouter.post("/subscribe/:assistanceId", userAuthenticated, controller.subscribeUser);
assistanceRouter.get("/subscribers/:assistanceId", userAuthenticated, allowedSearchField, controller.getSubscribers);
assistanceRouter.patch("/unsubscribe/:assistanceId", userAuthenticated, controller.unsubscribeUser);
assistanceRouter.post("/", userAuthenticated, controller.create);
assistanceRouter.get("/", allowedSearchField, controller.getAll);
assistanceRouter.get("/search", allowedSearchField, controller.searchQuery);

export default assistanceRouter;