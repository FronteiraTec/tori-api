const pool = require("../../utils/dbConnect");

module.exports = class {
    constructor(tableName) {
        if (tableName != null)
            this._from = `FROM ${tableName}`;

        this.querySQL = "$_e1g $_e2g $_e3g $_e4g"
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

        if (args.length > 1) {
            args.forEach(value => order += `${value}, `)
            order = "ORDER BY " + order;
        }
        else
            order = "ORDER BY " + args[0];

        this.querySQL = this.querySQL.replace("$_e3g", order);
        return this;
    }

    resolve() {
        this.querySQL = this.querySQL.replace("$_e1g", "");
        this.querySQL = this.querySQL.replace("$_e2g", this._from);
        this.querySQL = this.querySQL.replace("$_e3g", "");
        this.querySQL = this.querySQL.replace("$_e4g", "");

        return this.query(this.querySQL);
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
                errorHandler(err);
            }
        });
    }
}