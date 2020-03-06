const express = require("express");

const exampleController = require("../controllers/exampleController");


const router = express.Router();



router.get("/", exampleController.controller);

// // router.post();
// // router.put();



module.exports = router;