import mariadb from "mariadb";

const dbConnect = mariadb.createPool({
    connectionLimit: 15,
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE_NAME,
});

export default dbConnect;