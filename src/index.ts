
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import './helpers/LoadEnv';


import indexRoute from './routes/indexRoute';

const app = express();


// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}




// Static files
app.use('/static', express.static('public'));

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use(indexRoute);

// Server settings
// const server = '192.168.0.106';
const port = process.env.PORT;

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server is listening on http://localhost:${port}`);
});