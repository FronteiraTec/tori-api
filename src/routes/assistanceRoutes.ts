import { Router } from 'express';
import * as controller from '../controllers/AssistanceController';

const assistanceRouter: Router = Router();


assistanceRouter.get('/assistance', controller.getAll);
assistanceRouter.get('/assistance/search', controller.searchQuery);


export default assistanceRouter;