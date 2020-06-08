import { Router } from "express";
import * as controller from "../controllers/AssistanceController";
import { userAuthenticated } from "src/middleware/auth";

const assistanceRouter: Router = Router();


//TODO: document disable route
//TODO: get latitude and longitude from cep

assistanceRouter.delete("/:assistanceId", userAuthenticated, controller.deleteById);
assistanceRouter.patch("/disable/:assistanceId", userAuthenticated, controller.disableById);
assistanceRouter.patch("/:assistanceId", userAuthenticated, controller.update);
assistanceRouter.post("/subscribe/:assistanceId", userAuthenticated, controller.subscribeUser);
assistanceRouter.patch("/unsubscribe/:assistanceId", userAuthenticated, controller.unsubscribeUser);
assistanceRouter.get("/subscribers/:assistanceId", userAuthenticated, controller.getSubscribers);
assistanceRouter.post("/", userAuthenticated, controller.create);
assistanceRouter.get("/", controller.getAll);


//Fix: Protect the fields and blank or null fields
assistanceRouter.get("/search", controller.searchQuery);

export default assistanceRouter;