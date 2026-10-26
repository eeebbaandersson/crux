const { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

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

// Helper to set public bucket policy
const setBucketPublicPolicy = async (bucketName) => {
    const publicPolicy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${bucketName}/*`]
            }
        ]
    };

    try {
        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(publicPolicy)
        }));
        console.log(`S3 Bucket "${bucketName}" policy set to PUBLIC.`);
    } catch (error) {
        console.error('Could not set bucket policy:', error.message);
    }
};

// Verify that bucket exists in MinIO, otherwise create it
const ensureBucketExists = async () => {
    const bucketName = process.env.S3_BUCKET_NAME;
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName}));
        console.log(`S3 Bucket "${bucketName}" already exists.`);
        
        // Set public policy 
        await setBucketPublicPolicy(bucketName);
    } catch (error) {
        // (404/NotFound) --> create bucket
        try {
            console.log(`Bucket "${bucketName}" not found. Creating...`);
            await s3Client.send(new CreateBucketCommand({ Bucket: bucketName}));
            console.log(`S3 Bucket "${bucketName}" created successfully.`);
            
            // Set public policy  when bucket is created
            await setBucketPublicPolicy(bucketName);
        } catch (createError) {
            console.error('Could not create S3 bucket:', createError.message);
        }
    }
};

module.exports = { s3Client, ensureBucketExists };