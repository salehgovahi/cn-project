const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');

// Set up multer for file handling
const upload = multer({ dest: 'uploads/' }).single('video');

// Middleware to handle the POST update and call another service
const updateAndCallService = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ error: 'Error uploading file.' });
        }

        if (!req.file) {
            console.error('No file uploaded.');
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        try {
            // Prepare the form data for the external service
            const formData = new FormData();
            formData.append('video', fs.createReadStream(req.file.path), req.file.originalname);

            // Send the POST request with the form data
            const updateResponse = await axios.post(
                'http://127.0.0.1:6000/process/video',
                formData,
                {
                    headers: formData.getHeaders()
                }
            );

            req.playlistPath = updateResponse.data.playlistPath;
            req.videoLength = updateResponse.data.videoDuration;

            if (updateResponse.status !== 200) {
                console.error('Update failed with status:', updateResponse.status);
                return res.status(updateResponse.status).json({ error: 'Update failed.' });
            }

            next();
        } catch (err) {
            console.error('Error calling external service:', err.message);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                console.error('Response headers:', err.response.headers);
                return res.status(err.response.status).json({ error: err.response.data });
            } else if (err.request) {
                console.error('No response received:', err.request);
                return res.status(503).json({ error: 'Service unavailable.' });
            } else {
                console.error('Request error:', err.message);
                return res.status(500).json({ error: 'Internal server error.' });
            }
        } finally {
            // Cleanup: Remove the uploaded file from the server
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                }
            });
        }
    });
};

// Middleware for uploading video and extracting video length
const uploadVideo = (req, res, next) => {
    // Configure multer storage and file filter
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const folderUUID = uuidv4();
            const uploadPath = path.join(__dirname, '../processed/', folderUUID, 'original');
            fs.mkdirSync(uploadPath, { recursive: true });
            req.folderUUID = folderUUID; // Store the UUID for later use
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const originalName = file.originalname.replace(/\s+/g, '_');
            const uuidFileName = uuidv4() + '-' + originalName;
            cb(null, uuidFileName);
        }
    });

    const fileFilter = (req, file, cb) => {
        const videoTypes = /mp4/;
        const extname = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype;

        if (videoTypes.test(extname) && videoTypes.test(mimetype)) {
            return cb(null, true);
        } else {
            return cb(new Error('Only mp4 videos are allowed'));
        }
    };

    const upload = multer({
        storage: storage,
        fileFilter: fileFilter
    }).single('video'); // Match the field name you use in your form

    // Handle the upload and extract video length
    upload(req, res, (err) => {
        if (err) {
            return next(err); // Pass the error to the next middleware
        }

        // Path to the uploaded video file
        const videoPath = path.join(
            __dirname,
            '../processed/',
            req.folderUUID,
            'original',
            req.file.filename
        );

        // Extract video length using ffprobe
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return next(err); // Pass the error to the next middleware
            }

            req.videolength = metadata.format.duration; // Store video length in seconds
            next(); // Move to the next middleware or route handler
        });
    });
};

module.exports = { updateAndCallService, uploadVideo };
