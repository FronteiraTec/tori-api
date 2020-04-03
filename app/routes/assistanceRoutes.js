/* eslint-disable new-cap */

const express = require('express');
const controller = require('../controllers/AssistanceController');

const router = express.Router();


router.get('/assistance', controller.getAll);

router.get('/assistance/:id', controller.getByID);


router.get('/a', async (req, res, next) => {
    const dbHelper = require("../helpers/dbHelper");
    const db = new dbHelper();
    const a = await db.update("tag", {
        tag_name: "Guiaaa",
        tag_description: "Teste teste teste"
    })
    .where("tag_id", 1)
    .resolve();

    res.json(a);
});

module.exports = router;
