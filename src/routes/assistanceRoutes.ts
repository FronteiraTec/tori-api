import { Router } from "express";
import * as controller from "../controllers/AssistanceController";
import { userAuthenticated } from "src/middleware/auth";

const assistanceRouter: Router = Router();


assistanceRouter.post("/", userAuthenticated, controller.create);

//Fix: refactor this to works like it should on documentation
assistanceRouter.get("/", controller.getAll);
//Fix: refactor this to works like it should on documentation
assistanceRouter.get("/search", controller.searchQuery);


assistanceRouter.delete("/:assistanceId", controller.deleteById);
//TODO: Document this on .yaml
assistanceRouter.patch("/:assistanceId", controller.disableById);


//TODO: Update this assistance
assistanceRouter.patch("/", controller.searchQuery);

//TODO: get assistance subscribers
assistanceRouter.get("/subscribers", controller.searchQuery);

//TODO: subscribe to assistance
assistanceRouter.post("/subscribe/:assistanceId", controller.searchQuery);

//TODO: unsubscribe to assistance
assistanceRouter.patch("/unsubscribe/:assistanceId", controller.searchQuery);





export default assistanceRouter;