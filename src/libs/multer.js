import multer from 'multer';
import { ErrorHandler } from '../middlewares/error.js';

const fileTypes = {
  video: ['video/mp4', 'video/x-matroska'],
  image: ['image/jpg', 'image/jpeg', 'image/png'],
  document: ['application/pdf'],
};

let fileSize = 5 * 1024 * 1024; // 5MB

const multerConfig = multer({
  fileFilter: (req, file, cb) => {
    let allowedTypes;

    if (file.mimetype.split('/')[0] == 'image') {
      fileSize = 2 * 1024 * 1024;
      allowedTypes = fileTypes.image;
    } else if (file.mimetype.split('/')[0] == 'video') {
      fileSize = 5 * 1024 * 1024;
      allowedTypes = fileTypes.video;
    } else if (file.mimetype == 'application/pdf') {
      fileSize = 3 * 1024 * 1024;
      allowedTypes = fileTypes.document;
    } else {
      return cb(
        new ErrorHandler(
          400,
          'Invalid type. Please specify either video, image, or document.',
        ),
      );
    }

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      return cb(
        new ErrorHandler(
          400,
          `Only ${allowedTypes.join(', ')} are allowed for ${req.body.type}.`,
        ),
      );
    }
  },
  limits: {
    fileSize,
  },
  dest: (req, file, cb) => {
    cb(null, '/public/files');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
  storage: multer.memoryStorage(),
});

const fileHandlerMiddleware = multerConfig.fields([
  { name: 'identity_type', maxCount: 1 },
]);

export default fileHandlerMiddleware;
