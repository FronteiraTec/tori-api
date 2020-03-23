const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const assistanceRoute = require('./app/routes/assistanceRoute');
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(assistanceRoute);

const server = '192.168.0.107';
const port = '3001';

app.listen(3001, server, () => {
  console.log(`Server is listening on ${server}:${port}`);
});
