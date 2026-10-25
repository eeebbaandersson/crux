const { S3Client } = require('@aws-sdk/client-s3');

// Create configured S3Client instance
const s3Client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT, // points to http://localhost:9000 locally
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },

});

module.exports = { s3Client };