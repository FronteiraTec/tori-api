import { Router } from "express";
import * as controller from "src/controllers/assistanceController";
import { userAuthenticated } from "src/middleware/authMiddleware";
import { verifyIfUserHasPermission } from 'src/middleware/assistancePermission';

const assistanceRouter: Router = Router();

//TODO: document disable route
//TODO: get latitude and longitude from cep
//TODO: defined allowed search fields
assistanceRouter.delete("/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.deleteById);
assistanceRouter.patch("/disable/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.disableById);
assistanceRouter.patch("/:assistanceId", userAuthenticated, verifyIfUserHasPermission, controller.update);
assistanceRouter.post("/subscribe/:assistanceId", userAuthenticated, controller.subscribeUser);
assistanceRouter.get("/subscribers/:assistanceId", userAuthenticated, controller.getSubscribers);
assistanceRouter.patch("/unsubscribe/:assistanceId", userAuthenticated, controller.unsubscribeUser);
assistanceRouter.post("/", userAuthenticated, controller.create);
assistanceRouter.get("/", controller.getAll);
assistanceRouter.get("/search", controller.searchQuery);

export default assistanceRouter;