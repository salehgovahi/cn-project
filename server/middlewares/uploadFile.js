const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import the UUID function

// Define storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname).toLowerCase();
        const uuidFilename = uuidv4() + extname; // Generate UUID and append the original file extension
        cb(null, uuidFilename);
    }
});

// Define file filters for each file type
const fileFilter = (req, file, cb) => {
    const videoTypes = /mp4/;
    const imageTypes = /jpg|jpeg|png/;
    const pdfTypes = /pdf/;
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Check file type
    if (videoTypes.test(extname) && videoTypes.test(mimetype)) {
        return cb(null, true); // Accept all MP4 videos
    } else if (imageTypes.test(extname) && imageTypes.test(mimetype)) {
        return cb(null, true); // Accept images (2 MB limit will be handled in limits)
    } else if (pdfTypes.test(extname) && pdfTypes.test(mimetype)) {
        return cb(null, true); // Accept PDFs (10 MB limit will be handled in limits)
    } else {
        return cb(new Error('Only MP4 video, JPEG, PNG images, and PDF files are allowed'));
    }
};

// Create upload middleware with storage, file filter, and limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Export the upload middleware
module.exports = { upload };
