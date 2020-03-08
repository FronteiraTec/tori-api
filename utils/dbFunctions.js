/* eslint-disable no-async-promise-executor */
const pool = require('./dbConnect');

module.exports = class {
  constructor(table) {
    this.table = table;
  }

  async selectWhere(params) {
    return new Promise(async (resolve, reject) => {
      let conn;
      try {
        conn = await pool.getConnection();
        let queryStr = `SELECT ${params.select} `;
        queryStr += `FROM ${this.table} `;
        if (params.where) queryStr += `WHERE ${params.where}`;
        const rows = await conn.query(queryStr);
        if (rows.length > 0) {
          const dataInRows = [...rows];
          resolve(dataInRows);
        } else resolve(false);
      } catch (error) {
        conn.end();
        if (reject) reject(error);
      }
    });
  }
};
