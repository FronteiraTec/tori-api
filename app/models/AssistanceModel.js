const DbHelper = require('./../../utils/dbFunctions');

const dbFunc = new DbHelper('assistance');


module.exports = class {
  static async find() {
    const assistances = await dbFunc.selectWhere({ select: '*' });
    return assistances;
  }

  static async findOne(idAssistance) {
    const assistance = await dbFunc.selectWhere({ select: '*', where: `idAssistance = ${idAssistance}` });
    return assistance;
  }
};
