import { Router } from "express";
import * as controller from "../controllers/AssistanceController";
import { userAuthenticated } from "src/middleware/auth";

const assistanceRouter: Router = Router();


//TODO: document disable route
//TODO: update assistance address
//TODO: get latitude and longitude from cep


assistanceRouter.post("/", userAuthenticated, controller.create);

//Fix: refactor this to works like it should on documentation
assistanceRouter.get("/", controller.getAll);
//Fix: refactor this to works like it should on documentation
assistanceRouter.get("/search", controller.searchQuery);

assistanceRouter.delete("/:assistanceId", userAuthenticated, controller.deleteById);
assistanceRouter.patch("/disable/:assistanceId", userAuthenticated, controller.disableById);
assistanceRouter.patch("/:assistanceId", userAuthenticated, controller.update);



assistanceRouter.post("/subscribe/:assistanceId", userAuthenticated, controller.subscribeUser);
assistanceRouter.patch("/unsubscribe/:assistanceId", userAuthenticated, controller.unsubscribeUser);
assistanceRouter.get("/subscribers/:assistanceId", userAuthenticated, controller.getSubscribers);





export default assistanceRouter;