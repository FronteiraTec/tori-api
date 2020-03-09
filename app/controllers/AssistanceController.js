const assistanceModel = require('../models/AssistanceModel');


exports.getAllAssistance = async (req, res) => {
  try {
    const allAssistance = await assistanceModel.getAllAssistance();
    res.status(200).json(allAssistance);
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
};

exports.getAssistance = async (req, res) => {
  const { id } = req.params;
  try {
    const assistance = await assistanceModel.getAssistance(id);
    res.status(200).json(assistance[0]);
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
};