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
// const server = '192.168.0.106';
const port = '3000';

app.listen(port, () => {
  // console.log(`Server is listening on http://${server}:${port}`);
  console.log(`Server is listening on http://localhost:${port}`);
});