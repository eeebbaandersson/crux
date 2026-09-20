require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Import routes and define base-url 
const problemRoutes = require('./routes/problemRoutes');
app.use('/api/problems', problemRoutes);


// Call to verify database connection using minimal SQL-query
app.get('/api/health', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT 1 + 1 AS result');
        res.json({ status: 'ok', database: 'connected', result: rows[0].result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});