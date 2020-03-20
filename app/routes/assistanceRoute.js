/* eslint-disable new-cap */
const express = require('express');

const assistanceController = require('../controllers/AssistanceController');

const router = express.Router();

router.get('/assistance', assistanceController.getAllAssistance);
router.get('/assistance/:id', assistanceController.getAssistance);

module.exports = router;
