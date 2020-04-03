const mariadb = require('mariadb');

module.exports = mariadb.createPool({
    connectionLimit: 15,
    host: '131.108.55.50',
    user: 'patrick',
    password: 'patrick',
    database: 'myDB_test',
});