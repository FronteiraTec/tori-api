import mariadb from 'mariadb';

const dbConnect = mariadb.createPool({
    connectionLimit: 15,
    host: '131.108.55.50',
    user: 'patrick',
    password: 'patrick',
    database: 'myDB_test',
});

export default dbConnect;