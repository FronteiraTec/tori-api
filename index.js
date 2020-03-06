const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//all routes should be imported here
const exampleRoute = require("./app/routes/exampleRoute");


const app = express();



//Middlewares
app.use(bodyParser.json());
app.use(cors());



//Routes
app.use(exampleRoute);


const server = "localhost";
const port = "3000";

app.listen(3000, server, _ => {
    console.log(`Server is listening on ${server}:${port}`);
});