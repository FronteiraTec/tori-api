/* eslint-disable no-async-promise-executor */
const pool = require('./dbConnect');

module.exports = class {
  constructor(table) {
    this.table = table;
    this.tipe = 'exec'
    this.operators = {
      equal: '=',
    }
  }

  async select(params) {
    return new Promise(async (resolve, reject) => {
      let conn;
      try {
        conn = await pool.getConnection();
        let queryStr = `SELECT ${params.values.join(',')}`;
        queryStr += ` FROM ${params.table} `
        if (params.where.length !== 0) queryStr += `WHERE ${this.where(params.where)}`;
        if (params.orderBy.length !== 0) queryStr += `${this.orderBy(params.orderBy)}`;
        const rows = await conn.query(queryStr);
        if (rows.length > 0) {
          const dataInRows = [...rows];
          resolve([
            {
              status: true,
              data: dataInRows,
              orderBy: params.orderBy,
              message: "Registro encontrados",

            }
          ])
        } else {
          resolve([
            {
              status: false,
              data: [],
              orderBy: params.orderBy,
              message: "Nenhum registro encontrado",
            }
          ])
        }
      } catch (error) {
        conn.end();
        if (reject) reject(error);
      }
    });
  }

  where(options) {
    let where = '';
    options.forEach(element => {
      where += `${element.field ? element.field : ''}  ${element.op ? element.op : ''}  ${element.value ? element.value : ''}  ${element.opCond ? element.opCond : ''} `
    });
    return where;
  }

  orderBy(options) {
    let orderBy = '';
    options.forEach(element => {
      orderBy += ` ${element.order ? 'ORDER BY ' + element.value + ' ' + element.sortValue : ''} `
    });
    return orderBy;
  }
};