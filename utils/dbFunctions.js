/* eslint-disable require-jsdoc */
/* eslint-disable no-async-promise-executor */
const pool = require('./dbConnect');

module.exports = class {
  constructor(table) {
    this.table = table;
    this.tipe = 'exec';
  }

  async select(params) {
    return new Promise(async (resolve, reject) => {
      let conn;
      try {
        conn = await pool.getConnection();
        let queryStr = `SELECT ${params.values.join(',')}`;
        queryStr += ` FROM ${params.table} `;
        if (params.where.length !== 0) queryStr += `WHERE ${this.where(params.where)}`;
        if (params.orderBy.length !== 0) queryStr += `${this.orderBy(params.orderBy)}`;
        queryStr += `LIMIT ${this.limit(params.limit)}`;
        queryStr += ` OFFSET ${this.offset(params.offset)}`;
        console.log(queryStr)
        const rows = await conn.query(queryStr);
        if (rows.length > 0) {
          const dataInRows = [...rows];
          resolve([
            {
              status: true,
              data: dataInRows,
              orderBy: params.orderBy,
              message: 'Registro encontrados',

            },
          ]);
        } else {
          resolve([
            {
              status: false,
              data: [],
              orderBy: params.orderBy,
              message: 'Nenhum registro encontrado',
            }
          ])
        }
      } catch (error) {
        conn.end();
        if (reject) reject(error);
      }
    });
  }

  where(where) {
    let result = '';
    where.forEach((element) => {
      result += `${element.field ? element.field : ''}  ${element.op ? element.op : ''}  ${element.value ? element.value : ''}  ${element.opCond ? element.opCond : ''} `;
    });
    return result;
  }

  orderBy(orderBy) {
    let result = '';
    orderBy.forEach((element) => {
      result += ` ${element.order ? 'ORDER BY ' + element.value + ' ' + element.sortValue : ''} `;
    });
    return result;
  }
  limit(limit) {
    return `${limit ? limit : 10}`;
  }
  offset(offset) {
    console.log(`to aqui`);
    console.log(offset);
    return ` ${offset ? offset : 1}`;
  }
};
