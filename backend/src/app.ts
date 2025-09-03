import express from 'express';
import cors from 'cors';
import apiRouter from './routes';

const app = express();

// Parse incoming JSON requests
app.use(express.json());
// Enable Cross-Origin Resource Sharing
app.use(cors());

// Mount API routes under the /api prefix
app.use('/api', apiRouter);

export default app;