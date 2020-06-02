import { Router } from 'express';
import * as controller from '../controllers/AssistanceController';

const assistanceRouter: Router = Router();


assistanceRouter.get('/', controller.getAll);
assistanceRouter.get('/search', controller.searchQuery);


//TODO: create assistance
assistanceRouter.post('/', controller.searchQuery);
//TODO: delete assistance
assistanceRouter.delete('/', controller.searchQuery);

//TODO: Update this assistance
assistanceRouter.patch('/', controller.searchQuery);

//TODO: get assistance subscribers
assistanceRouter.get('/subscriber', controller.searchQuery);

//TODO: subscribe to assistance
assistanceRouter.post('/subscribe', controller.searchQuery);

//TODO: unsubscribe to assistance
assistanceRouter.patch('/unsubscribe', controller.searchQuery);





export default assistanceRouter;