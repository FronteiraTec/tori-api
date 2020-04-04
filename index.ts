
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import assistanceRouter from './app/routes/assistanceRoutes';

const app = express();

// Static files
app.use('/static', express.static('public'));

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use(assistanceRouter);

// Server settings
// const server = '192.168.0.106';
const port = '3000';

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server is listening on http://localhost:${port}`);
});