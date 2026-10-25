const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image format is allowed!'), false);
        }
    }
});

// Middleware function to optimize image using Sharp
const processImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        // Create unique file name 
        const filename = `problem-${Date.now()}.webp`;

        // Optimize and convert image
        const processedBuffer = await sharp(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Scale down larger images, keep smaller ones
        .webp({ quality: 80 }) // convert to webp with 80% quality
        .toBuffer();

        req.processedFile = {
            buffer: processedBuffer,
            filename: filename,
            mimetype: 'image/webp'
        };

        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Could not proccess image: ' + error.message
        });
    }
};

module.exports = {
    uploadSingle: upload.single('image'),
    processImage
};