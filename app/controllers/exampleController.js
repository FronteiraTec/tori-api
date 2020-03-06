const exampleModel = require("../models/exampleModel");


exports.controller = async (req, res, next) => {
    res.status(200).send("<h1>Ola mundo!</h1>");
    return;
};





exports.controller2 = async (req, res, next) => {
    res.status(200).json({
        ola: "mundo"
    });
    return;
};
