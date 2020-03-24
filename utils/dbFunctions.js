/* eslint-disable no-async-promise-executor */
const pool = require('./dbConnect');

module.exports = class {
  constructor(table) {
    this.table = table;
    this.tipe = 'exec';
  }

  
  /** TODO: preencher documentação de como usar a função select
   * @param {*} params Parametros obrigatorios
   * @param {*} params.values Parametros obrigatorios
   * @param {*} params.where Parametros obrigatorios
   * @param {*} params.orderBy Parametros obrigatorios
   * @param {*} params.limit Parametros obrigatorios
   * @param {*} params.offset Parametros obrigatorios
   * 
   * @returns
   */
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

        const rows = await conn.query(queryStr);

        //End the conection to avoid errors
        conn.end();

        if (rows.length == 0) {
          resolve({
            status: false,
            data: [],
            orderBy: params.orderBy,
            message: 'Nenhum registro encontrado',
          });
        }

        const dataInRows = [...rows];

        resolve({
          status: true,
          data: dataInRows,
          orderBy: params.orderBy,
          message: 'Registro encontrados',
        });
      }
      catch (error) {
        if (reject) reject(error);
      }
    });
  }

  /**
  /** TODO: preencher documentação de como usar a where
   *
   *
   * @param {*} where
   * @returns
   */
  where(where) {
    let result = '';
    where.forEach((element) => {
      result += `${element.field ? element.field : ''}  ${element.op ? element.op : ''}  ${element.value ? element.value : ''}  ${element.opCond ? element.opCond : ''} `;
    });
    return result;
  }

  /**
  /** TODO: preencher documentação de como usar a função orderBy
   * 
   *
   * @param {*} orderBy
   * @returns
   */
  orderBy(orderBy) {
    let result = '';
    orderBy.forEach((element) => {
      result += ` ${element.order ? 'ORDER BY ' + element.value + ' ' + element.sortValue : ''} `;
    });
    return result;
  }


  /** TODO: preencher documentação de como usar a função limit
   * 
   *
   * @param {*} limit
   * @returns
   */
  limit(limit) {
    return `${limit ? limit : 10}`;
  }

  /** TODO: preencher documentação de como usar a função offset
   *
   * @param {*} offset
   * @returns
   */
  offset(offset) {
    return ` ${offset ? offset : 0}`;
  }

};
