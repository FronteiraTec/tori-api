/* eslint-disable new-cap */

const express = require('express');
const controller = require('../controllers/AssistanceController');

const router = express.Router();

router.get('/assistance', controller.getAll);
router.get('/assistance/:id', controller.getByID);



module.exports = router;
