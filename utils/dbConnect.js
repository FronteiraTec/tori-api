const mariadb = require('mariadb');

module.exports = mariadb.createPool({
    connectionLimit: 15,
    host: 'localhost',
    user: 'mon',
    password: '1234',
    database: 'myDB',
});