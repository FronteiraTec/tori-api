/* eslint-disable require-jsdoc */

const DbHelper = require('./../../utils/dbFunctions');

const dbFunc = new DbHelper('assistance');


module.exports = class {
  /**
   * @static 
   * @returns {[assistances]} List of all assistances  
   */

  static async getAll() {
    return await dbFunc.select({
      values: ['*'],
      table: dbFunc.table,
      where: [],
      orderBy: [{ 'value': 'idAssistance', 'sortValue': 'DESC' }],
      limit: '',
      page: '0',
    });
  }

  /**
   * @static
   * @param {*} idAssistance
   * @returns {assistance} returns an assistance 
   */
  static async getAssistance(idAssistance) {
    return await dbFunc.select({
      values: ['*'],
      table: dbFunc.table,
      where: [{
        'field': 'idAssistance', 'op': '=', 'value': idAssistance
      }],
      orderBy: [],
      limit: '1',
      page: '1',
    });
  };

};
