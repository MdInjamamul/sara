const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Upload product image (admin only)
// @route   POST /api/upload
router.post('/', protect, admin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }
    res.json({
        message: 'Image uploaded successfully',
        imageUrl: `/uploads/${req.file.filename}`
    });
});

// @desc    Upload user avatar (authenticated users)
// @route   POST /api/upload/avatar
router.post('/avatar', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }
    res.json({
        message: 'Avatar uploaded successfully',
        imageUrl: `/uploads/${req.file.filename}`
    });
});

module.exports = router;
