const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const assistanceRoutes = require('./app/routes/assistanceRoutes');

const app = express();

//Middlewares
app.use(bodyParser.json());
app.use(cors());

//Routes
app.use(assistanceRoutes);


//Server settings
const server = 'localhost';
const port = '3000';

app.listen(port, server, () => {
  console.log(`Server is listening on http://${server}:${port}`);
});