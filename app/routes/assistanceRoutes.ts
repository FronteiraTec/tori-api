/* eslint-disable new-cap */

import express, { Router } from 'express';

import * as controller from '../controllers/AssistanceController';
import { db } from '../helpers/dbHelper';

const assistanceRouter: Router = express.Router();

assistanceRouter.get('/assistance', controller.getAll);

assistanceRouter.get('/assistance/:id', controller.getByID);


assistanceRouter.get('/a', async (req, res) => {

    const a = await db.query(`SELECT * FROM assistance as a
    JOIN user ON a.assistance_owner_id = user.user_id
    JOIN course AS c1 ON user.user_course_id = c1.course_id
    JOIN address ON assistance_local_id = address.address_id
    JOIN course AS c2 ON c2.course_id = user.user_course_id WHERE a.assistance_id = 1`, null);

    res.json(a);
});

export default assistanceRouter;
