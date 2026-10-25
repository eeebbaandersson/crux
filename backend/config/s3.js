const { S3Client, HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');

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

// Verify that bucket exists in MinIO, otherwise create it
const ensureBucketExists = async () => {
    const bucketName = process.env.S3_BUCKET_NAME;
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName}));
        console.log(`S3 Bucket "${bucketName}" already exists.`);
    } catch (error) {
        // (404/NotFound) --> create bucket
        try {
            console.log(`Bucket "${bucketName}" not found. Creating...`);
            await s3Client.send(new CreateBucketCommand({ Bucket: bucketName}));
            console.log(`S3 Bucket "${bucketName}" created successfully.`);
        } catch (createError) {
            console.error('Could not create S3 bucket:', createError.message);

        }
    }

}

module.exports = { s3Client, ensureBucketExists };