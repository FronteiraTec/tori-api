const assistanceModel = require('../models/AssistanceModel');


exports.index = async (req, res) => {
  try {
    const allAssistance = await assistanceModel.find();
    res.status(200).json(allAssistance);
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
};

exports.show = async (req, res) => {
  const { id } = req.params;
  try {
    const assistance = await assistanceModel.findOne(id);
    res.status(200).json(assistance[0]);
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
};
