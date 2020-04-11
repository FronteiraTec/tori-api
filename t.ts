// function join(table1: string, table2: string): string {
//     const objTable1 = parseJoin(table1);
//     const objTable2 = parseJoin(table2);

//     let join: string;

//     if(objTable1.alias === null && objTable2.alias === null)
//         join = `JOIN ${objTable1.tableName} ON ${objTable1.unionField} = ${objTable2.unionField}`;

//     // Pick the first one and use the alias of the second
//     else if(objTable1.alias !== null && objTable2.alias !== null)
//         join = `JOIN ${objTable1.tableName} AS ${objTable1.alias} ON ${objTable1.unionField} = ${objTable2.unionField}`;

//     // First one do has an alias, second one no
//     else if(objTable1.alias !== null && objTable2.alias === null)
//         join = `JOIN ${objTable1.tableName} AS ${objTable1.alias} ON ${objTable1.unionField} = ${objTable2.unionField}`;

//     // First one has no alias at all, second one got one
//     else if(objTable1.alias === null && objTable2.alias !== null)
//         join = `JOIN ${objTable2.tableName} AS ${objTable2.alias} ON ${objTable2.unionField} = ${objTable1.unionField}`;

//     this.querySQL = this.querySQL.replace("$_e3g", join + " $_e3g");
//     return this;
//     // return this;
// }



// function parseJoin(table: string): joinField {
//     const searchQuery = " as ";
//     const hasAlias = table.toLowerCase().search(searchQuery);

//     if(hasAlias > 0){ // Possui alias
//         const splitedAliasSearch = table.substring(hasAlias + searchQuery.length).split(" ");

//         const alias: string = splitedAliasSearch[0];
//         const tableName = table.substring(0, hasAlias).trim();
//         const unionField = splitedAliasSearch[1];

//         const res: joinField = {
//             alias,
//             tableName,
//             unionField
//         };

//         return res;
//     }
//     else {
//         const tableName = table.split(".")[0];
//         const unionField = table;

//         const res: joinField = {
//             alias: null,
//             tableName,
//             unionField
//         };

//         return res;
//     }
// }

// interface joinField {
//     alias?: String,
//     tableName: String,
//     unionField: String
// };

// join("assistance AS a a.assistance_id", "user AS u u.user_id");
// join("a.assistance_id", "u.user_id");
// join("assistance AS a a.assistance_id", "user.user_id");
// join("assistance.assistance_id", "user AS u u.user_id");


// // join("assistance.id", "monitor.id");
