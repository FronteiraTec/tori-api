const pool = require("../../utils/dbConnect");

module.exports = class {
    #_from;

    constructor(tableName) {
        if (tableName != null)
            this.#_from = `FROM ${tableName}`;

        this.clearQuery();
    }

    select(string = "*") {
        const select = `SELECT ${string}`;

        this.querySQL = this.querySQL.replace("$_e1g", select);
        return this;
    }

    from(string = "") {
        let from;

        if (this.from != null && string != "")
            from = `FROM ${string}`;

        else from = this._from;

        this.querySQL = this.querySQL.replace("$_e2g", from);
        return this;
    }

    where(...args) {
        let where;

        if (args.length == 1)
            where = `WHERE ${args[0]}`;
        else
            where = `WHERE ${args[0]} = ${args[1]}`;

        this.querySQL = this.querySQL.replace("$_e4g", where);

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
        const lim = `LIMIT ${limit}`;
        const off = `OFFSET ${offset}`;

        this.querySQL = this.querySQL.replace("$_e6g", lim);
        this.querySQL = this.querySQL.replace("$_e7g", off);

        return this;
    }

    join(currentTable, toTable) {
        // JOIN user ON assistance.idAssistant = user.id 

        // JOIN ${argsTo[0]} ON ${currentTable} = ${toTable}

        const argsTo = toTable.split(".");
        // const currentTable = (this._from ? _this.currentTable : args[1]) + args[2];
        // if(this._from)
        let join = `JOIN ${argsTo[0]} ON ${currentTable} = ${toTable}`;
        
        this.querySQL = this.querySQL.replace("$_e3g", join);

        return this;
    }

    resolve() {
        this.querySQL = this.querySQL.replace("$_e1g", "");
        this.querySQL = this.querySQL.replace("$_e2g", this.#_from);
        this.querySQL = this.querySQL.replace("$_e3g", "");
        this.querySQL = this.querySQL.replace("$_e4g", "");
        this.querySQL = this.querySQL.replace("$_e5g", "");
        this.querySQL = this.querySQL.replace("$_e6g", "");
        this.querySQL = this.querySQL.replace("$_e7g", "");
                
        const sql = this.querySQL;
        
        this.clearQuery();
        
        return this.query(sql);
    }

    clearQuery() {
        this.querySQL = "$_e1g $_e2g $_e3g $_e4g $_e5g $_e6g $_e7g";
    }

    async query(query, args) {
        return new Promise(async (resolve, reject) => {

            const queryVar = args;
            const queryStr = query;
            let conn;

            try {
                conn = await pool.getConnection();
                const rows = await conn.query(queryStr, queryVar);

                conn.end();
                resolve(rows);
            } catch (err) {
                conn.end();
                if (reject) reject(err);
                //TODO: implementar o helper de erro e o utilizar
                errorHandler(err);
            }
        });
    }
}