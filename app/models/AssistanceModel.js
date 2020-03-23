/* eslint-disable require-jsdoc */
const DbHelper = require('./../../utils/dbFunctions');

const dbFunc = new DbHelper('assistance');

module.exports = class {
  static async getAllAssistance() {
    const assistances = await dbFunc.select(
        {
          values: ['*'],
          table: dbFunc.table,
          where: [],
          orderBy: [{'value': 'idAssistance', 'sortValue': 'DESC'}],
          limit: '',
          page: '0',
        });
    return assistances;
  }

  static async getAssistance(idAssistance) {
    const assistance = await dbFunc.select(
        {
          values: ['*'],
          table: dbFunc.table,
          where: [
            {'field': 'idAssistance', 'op': '=', 'value': idAssistance},
          ],
          orderBy: [],
          limit: '1',
          page: '1',
        });
    return assistance;
  };
};
