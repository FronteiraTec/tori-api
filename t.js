function insertInto(tableName = null, args) {
    const fieldNames = Object.keys(args);

    const valuesArray = fieldNames.map((field, i) => {
        return {[`insert${i}`] : args[field]}
    });

    const placeholders = valuesArray.map((_, i) => `:insert${i}, `).join("").slice(0, -2);

    const valuesString = fieldNames.map(name => `${name}, `).join("").slice(0, -2);

    // if(tableName == null) tableName = this.#_from;

    const insert = `INSERT INTO ${tableName} (${valuesString}) VALUES (${placeholders})`;

    console.log(insert);
    console.log(valuesArray);


    const dataInsert = valuesArray;

    // this.querySQL = this.querySQL.replace("$_e1g", insert);


}

// insertInto("tag", {tag_name: "Joao", tag_description: "uma tag muito louca"});

a = {name: 12, id: 23, rel: 534}
b = {sup: 12, cacp: 23, eme: 534}
c = {forp: 12, gaal: 23, asdh: 534}
d = undefined

vec = {...a, ...b, ...c, ...d} 

// vec.push(a, b, c)

console.log(vec)