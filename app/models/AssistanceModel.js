/* eslint-disable require-jsdoc */

const DbHelper = require('./../../utils/dbFunctions');

const dbFunc = new DbHelper('assistance');

const dbHelper = require("../helpers/dbHelper");

const db = new dbHelper();


module.exports = class {
  /**
   * @static 
   * @returns {[assistances]} List of all assistances  
   */

  static async getAll(limit, offset, avaliable) {
    db.select().from("assistance").
      orderBy("id", "DESC");

      console.log(avaliable);

      if(avaliable != undefined){
        console.log("OOO")
        db.where("avaliable", avaliable ? true: "");
      }

      if(limit != undefined && offset != undefined)
        db.pagination(limit, offset);
      

      const rowsAndInfos = await db.resolve();
      const assistances = [... rowsAndInfos];

      return assistances;
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
