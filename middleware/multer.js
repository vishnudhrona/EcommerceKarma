const multer = require('multer');

// Set up Multer storage engine to save files to the public folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/banner-images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Set up Multer upload middleware with the storage engine
const upload = multer({ storage: storage }).single('Image');

// Middleware function to handle image uploads
function saveImage(req, res, next) {
  upload(req, res, function (err) {
    if (err) {
        console.error(err)
      // If there was an error during upload, return a 400 Bad Request status
      return res.status(400).send({
        message: 'There was an error uploading the image'
      });
    }

    // If upload was successful, move on to the next middleware or route handler
    next();
  });
}

module.exports = saveImage;
