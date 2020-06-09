
import express, { NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import './helpers/loadEnvHelper';


import indexRoute from './routes/indexRoute';
import { errorHandler } from './middleware/errorMiddleware';
import { createFolders } from './helpers/startConfigurationsHelper';

// Create folders
createFolders();

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
app.use("/public", express.static('src/public'));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Routes
app.use(indexRoute);

app.use(errorHandler);

// Server settings
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});