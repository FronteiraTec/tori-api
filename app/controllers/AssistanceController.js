const model = require('../models/AssistanceModel');

exports.getAll = async (req, res) => {
  try {
    const allAssistance = await model.getAll();
    res.status(200).json(allAssistance);

  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
};

exports.getByID = async (req, res) => {
  const { id } = req.params;

  try {
    const assistance = await model.getByID(id);

    res.status(200).json(assistance);
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
};



