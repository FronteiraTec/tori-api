const express = require('express');

const assistanceController = require('../controllers/AssistanceController');

const router = express.Router();

router.get('/assistance', assistanceController.index);
router.get('/assistance/:id', assistanceController.show);

module.exports = router;
