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

      if(avaliable != undefined){
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
  static async getByID(id) {    
    const assistance = await db.select().from("assistance").where("id", id).resolve();

    return assistance[0];
  };

};
