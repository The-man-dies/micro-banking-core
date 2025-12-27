import express from 'express';
import cors from 'cors';
import api from './api';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1', api);

// Health check route
app.get('/', (req, res) => {
    res.send('Mini Banking API is running');
});

export default app;
