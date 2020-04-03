const pool = require("../../utils/dbConnect");

module.exports = class {
    #_from = "";
    #_data = {};
    querySQL = "$_e1g $_e2g $_e3g $_e4g $_e5g $_e6g $_e7g";
    #whereCount = 0;
    #orCount = 0;
    #andCount = 0;
    #likeCount = 0;

    constructor(tableName) {
        if (tableName != null)
            this.#_from = tableName;
    }

    /**
     *
     *
     * @param {string} [string="*"] Por padrão retorna tudo, os campos que deveram ser
     * retornado podem ser colocados aqui
     * @returns
     */
    select(string = "*") {
        const select = `SELECT ${string}`;

        this.querySQL = this.querySQL.replace("$_e1g", select);
        return this;
    }


    /**
     * @param {string} [string=""] nome da tabela que sera comparada.
     * Pode ser deixado em branco caso a classe seja instanciada
     */
    from(string = "") {
        let from;

        if (string != "")
            from = `FROM ${string}`;

        else from = `FROM ${this.#_from}`;

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
    where(...args) {
        let where;
        let key = args[0];
        let val = args[1];

        if (args.length == 1) {
            if (key.find("=") >= 0) {
                const parameters = key.split("=");
                const argsSplited = parameters.map((val) => val.trim());

                key = argsSplited[0];
                val = argsSplited[1];
            }
            else {
                where = `WHERE ${key} $_e4.1g`;
                this.querySQL = this.querySQL.replace("$_e4g", where);
                return this;
            }
        }

        where = `WHERE (${key} = :where${this.#whereCount}) $_e4.1g `;
        this.#_data.where = { [`where${this.#whereCount++}`]: val };

        this.querySQL = this.querySQL.replace("$_e4g", where);

        return this;
    }

    or(...args) {
        let or;

        if (args.length == 2) {
            or = `OR (${args[0]} = :or${this.#orCount}) $_e4.1g `;

            if (this.#_data.or == undefined)
                this.#_data.or = { [`or${this.#orCount++}`]: args[1] };
            else {
                this.#_data.or = Object.assign({}, this.#_data.or, {[`or${this.#orCount++}`]: args[1]});
            }
        }
        else {
            or = `OR (${args[0]} $_e4.1g)`;
        }
        
        this.querySQL = this.querySQL.replace("$_e4.1g", or);

        return this;
    }

    and(...args) {
        let and;

        if (args.length == 2) {
            and = `AND (${args[0]} = :and${this.#andCount}) $_e4.1g `;

            if (this.#_data.and == undefined)
                this.#_data.and = { [`and${this.#andCount++}`]: args[1] };
            else {
                this.#_data.and = Object.assign({}, this.#_data.and, {[`and${this.#andCount++}`]: args[1]});
            }
        }
        else {
            and = `AND (${args[0]} $_e4.1g)`;
        }
        
        this.querySQL = this.querySQL.replace("$_e4.1g", and);

        return this;
    }

    orderBy(...args) {
        let order;

        if (args.length == 2) {
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

    pagination(limit, offset) {
        if (isNaN(limit) || isNaN(offset)) {
            //TODO implementar o erro;
            const error = new Error();
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
    join(currentTable, toTable) {
        const argsTo = toTable.split(".");

        let join = `JOIN ${argsTo[0]} ON ${currentTable} = ${toTable}`;

        this.querySQL = this.querySQL.replace("$_e3g", join + " $_e3g");

        return this;
    }

    /**
     *
     *
     * @param {*} tableName nome da tabela
     * @param {*} args valores que seram inseridos no banco. PS: cada valor é posicional
     * Alem disso, é importante ressaltar que todos os valores devem ser adicionados
     * De acordo com a ordem que os mesmos estao alocados no banco de dados
     */
    insert(tableName = null, ...args) {
        let insert;

        const placeholders = args.map((val, i) => `:insert${i}, `).join("").slice(0, -2);

        insert = placeholders;

        if (tableName == null) tableName = this.#_from;

        insert = `INSERT INTO ${tableName} VALUES (${insert})`;

        const argsObjectList = args.map((val, i) => {
            return {
                [`:insert${i}`]: val
            }
        });

        this.#_data.insert = Object.assign({}, ...argsObjectList);

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
    insertInto(tableName = null, args) {
        const fieldNames = Object.keys(args);


        const insertDataObject = fieldNames.map((field, i) => {
            return { [`insert${i}`]: args[field] }
        });

        const placeholders = insertDataObject.map((_, i) => `:insert${i}, `).join("").slice(0, -2);


        const valuesString = fieldNames.map(name => `${name}, `).join("").slice(0, -2);

        if (tableName == null) tableName = this.#_from;

        const insert = `INSERT INTO ${tableName} (${valuesString}) VALUES (${placeholders})`;

        this.#_data.insert = Object.assign({}, ...insertDataObject);

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
    delete(tableName = null) {
        let deleteQuery;

        if (tableName == null) {
            deleteQuery = `DELETE $_e1g`;

            if (this.#_from != "")
                deleteQuery = deleteQuery.replace("$_e1g", `FROM ${this.#_from}`);
        }

        else {
            deleteQuery = `DELETE FROM ${tableName}`;
        }

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
    update(tableName = null, args) {
        const fieldNames = Object.keys(args);

        const setQuery = fieldNames.map((field, i) => `${field} = :update${i}, `).join("").slice(0, -2);

        const valuesArray = fieldNames.map((field, i) => {
            return { [`update${i}`]: args[field] }
        });

        if (tableName == null) tableName = this.#_from;

        const updateQuery = ` UPDATE ${tableName} SET ${setQuery}`;

        this.querySQL = this.querySQL.replace("$_e1g", updateQuery);

        this.#_data.update = Object.assign({}, ...valuesArray);

        return this;
    }

    resolve() {
        this.querySQL = this.querySQL.replace("$_e1g", "");
        this.querySQL = this.querySQL.replace("$_e2g", "");
        this.querySQL = this.querySQL.replace("$_e3g", "");
        this.querySQL = this.querySQL.replace("$_e4g", "");
        this.querySQL = this.querySQL.replace("$_e4.1g", "");
        this.querySQL = this.querySQL.replace("$_e5g", "");
        this.querySQL = this.querySQL.replace("$_e6g", "");
        this.querySQL = this.querySQL.replace("$_e7g", "");

        const sql = this.querySQL;

        const data = this.#_data;

        // if (this.#_data.insert !== undefined) args.push(...this.#_data.insert);
        // if (this.#_data.update !== undefined) args.push(...this.#_data.update);

        // if (this.#_data.where !== undefined) args.push(this.#_data.where);

        const args = { ...data.insert, ...data.update, ...data.where, ...data.or, ...data.and}

        this.clearQuery();


        return this.query(sql, args);
    }

    async query(query, args) {
        return new Promise(async (resolve, reject) => {

            const queryVar = args;
            const queryStr = query;
            let conn;

            try {
                conn = await pool.getConnection();
                const rows = await conn.query({ sql: queryStr, namedPlaceholders: true }, queryVar);

                conn.end();
                resolve(rows);
            } catch (err) {
                conn.end();
                // throw err;
                if (reject) reject(err);
                //TODO: implementar o helper de erro e o utilizar
                // errorHandler(err);
            }
        });
    }

    clearQuery() {
        this.querySQL = "$_e1g $_e2g $_e3g $_e4g $_e5g $_e6g $_e7g";
        this.#_data = {};
        this.#_from = "";
        this.#whereCount = 0;
        this.#orCount = 0;
        this.#andCount = 0;
        this.#likeCount = 0;
    }

    clearTableName() {
        this.#_from = "";
    }

    setTableName(tableName) {
        this.#_from = tableName;
    }
}