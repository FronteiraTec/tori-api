import { HTTPError } from "./customError";

import pool from "./dbConnect";

interface Data {
  where?: {},
  or?: {},
  and?: {},
  insert?: {},
  update?: {}
}


export default class DbHelper {
  private _from = "";
  private _data: Data = {};
  private querySQL = "$_e1g $_e2g $_e3g $_e4g $_e5g $_e6g $_e7g";
  private _whereCount = 0;
  private _orCount = 0;
  private _andCount = 0;

  public constructor(tableName: string = "") {
    if (tableName != "")
      this._from = tableName;

  }

  /**
   *
   *
   * @param {string} [string="*"] Por padrão retorna tudo, os campos que deveram ser
   * retornado podem ser colocados aqui
   * @returns
   */
  select(query: string = "*"): this {
    const select = `SELECT ${query}`;

    this.querySQL = this.querySQL.replace("$_e1g", select);
    return this;
  }


  /**
   * @param {string} [string=""] nome da tabela que sera comparada.
   * Pode ser deixado em branco caso a classe seja instanciada
   */
  from(query = ""): this {
    let from: string;

    if (query !== "")
      from = `FROM ${query}`;

    else from = `FROM ${this._from}`;

    this.querySQL = this.querySQL.replace("$_e2g", from);
    return this;
  }

  /**
   * @param {string} args nome do campo a ser comparado ou query de comparação
   * @param {string} args campo a ser comparado. Opcionado
   * @example where("nome_campo", "valor_a_ser_encontrado")
   * @example where("nome_campo = valor_a_ser_encontrado")
   * @returns
   */
  where(...args: string[]): this {
    let where: string;
    let key: string = args[0];
    let val: string = args[1];

    if (args.length === 1) {
      if (args[0].search("=") >= 0) {
        const parameters = key.split("=");
        const argsSplited = parameters.map((value) => value.trim());

        key = argsSplited[0];
        val = argsSplited[1];
      }
      else {
        where = `WHERE ${key} $_e4.1g`;
        this.querySQL = this.querySQL.replace("$_e4g", where);
        return this;
      }
    }

    where = `WHERE (${key} = :where${this._whereCount}) $_e4.1g `;
    this._data.where = { [`where${this._whereCount++}`]: val };

    this.querySQL = this.querySQL.replace("$_e4g", where);

    return this;
  }

  or(...args: string[]): this {
    let or;

    if (args.length === 2) {
      or = `OR (${args[0]} = :or${this._orCount}) $_e4.1g `;

      if (this._data.or === undefined)
        this._data.or = { [`or${this._orCount++}`]: args[1] };
      else {
        this._data.or = Object.assign({}, this._data.or, { [`or${this._orCount++}`]: args[1] });
      }
    }
    else {
      or = `OR (${args[0]}) $_e4.1g`;
    }

    this.querySQL = this.querySQL.replace("$_e4.1g", or);

    return this;
  }

  and(...args: string[]): this {
    let and;

    if (args.length === 2) {
      and = `AND (${args[0]} = :and${this._andCount}) $_e4.1g `;

      if (this._data.and === undefined)
        this._data.and = { [`and${this._andCount++}`]: args[1] };
      else {
        this._data.and = Object.assign({}, this._data.and, { [`and${this._andCount++}`]: args[1] });
      }
    }
    else {
      and = `AND (${args[0]}) $_e4.1g`;
    }

    this.querySQL = this.querySQL.replace("$_e4.1g", and);

    return this;
  }

  like(...pattern: string[]): this {
    let like = `LIKE '${pattern[0]}' `;

    if (pattern.length > 1)
      like += pattern[1];
    like += " $_e4.1g";

    this.querySQL = this.querySQL.replace("$_e4.1g", like);
    return this;
  }

  orderBy(...args: string[]): this {
    let order;

    if (args.length === 2) {
      order = args.join(" ");
      order = "ORDER BY " + order;
    }
    else if (args.length > 2) {
      order = args.join(", ");
      order = "ORDER BY " + order;
    }
    else
      order = "ORDER BY " + args[0];

    this.querySQL = this.querySQL.replace("$_e5g", order);
    return this;
  }

  pagination(limit: number, offset: number): this {
    if (isNaN(limit) || isNaN(offset)) {
      // TODO implementar o erro;
      const error = new HTTPError("Error message");
      error.statusCode = 400;
      throw error;
    }

    const lim = `LIMIT ${limit}`;
    const off = `OFFSET ${offset}`;

    this.querySQL = this.querySQL.replace("$_e6g", lim);
    this.querySQL = this.querySQL.replace("$_e7g", off);

    return this;
  }

  /**
   *
   *
   * @param {String} currentTable Nome da tabela e do campo que seram utilizadas no join ex: user.address_id PS: A TABELA DEVE TER SIDO REFERENCIADA ANTERIORMENTE
   * @param {String} toTable Nome da tabela e do campo que recebera o join. Ex:  address.address_id
   * @returns Retorna um objeto que pode ser encadeado com novas queries
   */

  join(table1: string, table2: string): this {
    const join = this.joinQueryBuilder("JOIN", table1, table2);

    this.querySQL = this.querySQL.replace("$_e3g", join + " $_e3g");

    return this;
  }

  leftJoin(table1: string, table2: string): this {
    const join = this.joinQueryBuilder("LEFT JOIN", table1, table2);

    this.querySQL = this.querySQL.replace("$_e3g", join + " $_e3g");

    return this;
  }

  rightJoin(table1: string, table2: string): this {
    const join = this.joinQueryBuilder("RIGHT JOIN", table1, table2);

    this.querySQL = this.querySQL.replace("$_e3g", join + " $_e3g");

    return this;
  }

  private joinQueryBuilder(joinType: string, table1: string, table2: string) {
    interface JoinField {
      alias?: string,
      tableName: string,
      unionField: string
    };

    const parseJoin = (table: string): JoinField => {
      const searchQuery = " as ";
      const hasAlias = table.toLowerCase().search(searchQuery);

      if (hasAlias > 0) {
        const splitedAliasSearch = table.substring(hasAlias + searchQuery.length).split(" ");

        const alias: string = splitedAliasSearch[0];
        const tableName = table.substring(0, hasAlias).trim();
        const unionField = splitedAliasSearch[1];

        const res: JoinField = {
          alias,
          tableName,
          unionField
        };

        return res;
      }
      else {
        const tableName = table.split(".")[0];
        const unionField = table;

        const res: JoinField = {
          tableName,
          unionField
        };

        return res;
      }
    }


    const objTable1 = parseJoin(table1);
    const objTable2 = parseJoin(table2);

    let join = "";

    if (objTable1.alias === undefined && objTable2.alias === undefined)
      join = `${joinType} ${objTable1.tableName} ON ${objTable1.unionField} = ${objTable2.unionField}`;

    // Pick the first one and use the alias of the second
    else if (objTable1.alias !== undefined && objTable2.alias !== undefined)
      join = `${joinType} ${objTable1.tableName} AS ${objTable1.alias} ON ${objTable1.unionField} = ${objTable2.unionField}`;

    // First one do has an alias, second one no
    else if (objTable1.alias !== undefined && objTable2.alias === undefined)
      join = `${joinType} ${objTable1.tableName} AS ${objTable1.alias} ON ${objTable1.unionField} = ${objTable2.unionField}`;

    // First one has no alias at all, second one got one
    else if (objTable1.alias === undefined && objTable2.alias !== undefined)
      join = `${joinType} ${objTable2.tableName} AS ${objTable2.alias} ON ${objTable2.unionField} = ${objTable1.unionField}`;

    return join;
  }

  /**
   *
   *
   * @param {*} tableName nome da tabela
   * @param {*} args valores que seram inseridos no banco. PS: cada valor é posicional
   * Alem disso, é importante ressaltar que todos os valores devem ser adicionados
   * De acordo com a ordem que os mesmos estao alocados no banco de dados
   */
  insertRaw(tableName: string = "", ...args: string[]): this {
    let insert;

    const placeholders = args.map((val, i) => `:insert${i}, `).join("").slice(0, -2);

    insert = placeholders;

    if (tableName === "") tableName = this._from;

    insert = `INSERT INTO ${tableName} VALUES (${insert})`;

    const argsObjectList = args.map((val, i) => {
      return {
        [`:insert${i}`]: val
      }
    });

    this._data.insert = Object.assign({}, ...argsObjectList);

    this.querySQL = this.querySQL.replace("$_e1g", insert);

    return this;
  }


  /**
   *
   *
   * @param {string} tableName nome da tabela da qual se deseja realizar a busca. Caso o nome seja null,
   * a tabela precisa ser instanciada
   * @param {object} args objeto onde a chave é o nome da tabela no campo e a key é o valor
   * {nome_campo: valor_a_ser_inserido}
   */
  insert(tableName: string = "", fieldsObject: Object): this {
    const fieldNames = Object.keys(fieldsObject) as Array<keyof typeof fieldsObject>;


    const insertDataObject = fieldNames.map((field: keyof typeof fieldsObject, i: number) => {
      return { [`insert${i}`]: fieldsObject[field] };
    });

    const placeholders = insertDataObject.map((_, i) => `:insert${i}, `).join("").slice(0, -2);


    const valuesString = fieldNames.map(name => `${name}, `).join("").slice(0, -2);

    if (tableName === "") tableName = this._from;

    const insert = `INSERT INTO ${tableName} (${valuesString}) VALUES (${placeholders})`;

    this._data.insert = Object.assign({}, ...insertDataObject);

    this.querySQL = this.querySQL.replace("$_e1g", insert);

    return this;

  }

  /**
   *
   *
   * @param {string} [tableName=null] Nome da tabela. Caso o nome da tabela seja deixado em branco
   * O metodo "from" deve ser utilizado. ou a classe deve ser instanciada com o
   * nome da sua respectiva tabela
   * @returns
   */
  delete(tableName: string = ""): this {
    let deleteQuery;

    if (tableName === "") {
      deleteQuery = `DELETE $_e1g`;

      if (this._from !== "")
        deleteQuery = deleteQuery.replace("$_e1g", `FROM ${this._from}`);
    }

    else
      deleteQuery = `DELETE FROM ${tableName}`;


    this.querySQL = this.querySQL.replace("$_e1g", deleteQuery);

    return this;
  }


  /**
   *
   *
   * @param {String} tableName nome da tabela
   * @param {Object} args nome campo a ser atualizado e seu novo valor. PS: o nome do campo
   * deve ser o mesmo no do banco
   * @example update("tag", {tag_name: newName})
   * @description Be careful when updating records in a table!
   * Notice the WHERE clause in the UPDATE statement.
   * The WHERE clause specifies which record(s) that should be updated.
   * If you omit the WHERE clause, all records in the table will be updated!
   */
  update(tableName: string = "", args: string[]): this {
    const fieldNames = Object.keys(args);

    const setQuery = fieldNames.map((field, i) => `${field} = :update${i}, `).join("").slice(0, -2);

    const valuesArray = fieldNames.map((field: any, i: number) => {
      return { [`update${i}`]: args[field] }
    });

    if (tableName === "") tableName = this._from;

    const updateQuery = ` UPDATE ${tableName} SET ${setQuery}`;

    this.querySQL = this.querySQL.replace("$_e1g", updateQuery);

    this._data.update = Object.assign({}, ...valuesArray);

    return this;
  }

  resolve(): Promise<object[]> {
    this.querySQL = this.querySQL.replace("$_e1g", "");
    this.querySQL = this.querySQL.replace("$_e2g", "");
    this.querySQL = this.querySQL.replace("$_e3g", "");
    this.querySQL = this.querySQL.replace("$_e4g", "");
    this.querySQL = this.querySQL.replace("$_e4.1g", "");
    this.querySQL = this.querySQL.replace("$_e5g", "");
    this.querySQL = this.querySQL.replace("$_e6g", "");
    this.querySQL = this.querySQL.replace("$_e7g", "");

    const sql = this.querySQL;

    const data = {};

    if (this._data.insert !== undefined) Object.assign(data, this._data.insert);
    if (this._data.update !== undefined) Object.assign(data, this._data.update);
    if (this._data.where !== undefined) Object.assign(data, this._data.where);
    if (this._data.or !== undefined) Object.assign(data, this._data.or);
    if (this._data.and !== undefined) Object.assign(data, this._data.and);

    this.clearQuery();

    return this.query({ query: sql, args: data });
  }

  async query({ query, args }: { query: string; args: object; }): Promise<object[]> {
    return new Promise(async (resolve, reject) => {

      const queryVar = args;
      const queryStr = query;
      try {
        const conn = await pool.getConnection();
        let rows = await conn.query({ sql: queryStr, namedPlaceholders: true, nestTables: true }, queryVar);

        if (rows.length === undefined)
          rows = [rows];

        conn.end();
        resolve(rows);
      } catch (err) {
        if (reject) reject(err);
      }
    });
  }

  clearQuery() {
    this.querySQL = "$_e1g $_e2g $_e3g $_e4g $_e5g $_e6g $_e7g";
    this._data = {};
    this._from = "";
    this._whereCount = 0;
    this._orCount = 0;
    this._andCount = 0;
  }

  clearTableName() {
    this._from = "";
  }

  setTableName(tableName: string) {
    this._from = tableName;
  }
}

export const db = new DbHelper();

