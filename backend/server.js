require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const { ensureBucketExists } = require('./config/s3');

const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('./config/s3');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));


// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/users/:userId/sessions', sessionRoutes);

const problemRoutes = require('./routes/problemRoutes');
app.use('/api/sessions/:sessionId/problems', problemRoutes);
app.use('/api/users/:userId/problems', problemRoutes);

// Proxy route to get Images from MinIO
app.get('/api/images/:filename', async (req, res) => {
    const filename = req.params.filename;
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: filename,
        });

        const response = await s3Client.send(command);

        // Set Content-Type
        res.setHeader('Content-Type', response.ContentType || 'image/webp');

        // Stream image data from MinIO client
        response.Body.pipe(res);
    } catch (error) {
        console.error('Could not get image from MinIO', error.message);
        res.status(404).json({ error: 'Image not found'});
    }
});


// Call to verify database connection using minimal SQL-query
app.get('/api/health', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT 1 + 1 AS result');
        res.json({ status: 'ok', database: 'connected', result: rows[0].result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await ensureBucketExists();
});