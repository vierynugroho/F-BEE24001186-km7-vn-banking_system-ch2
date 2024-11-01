import multer from 'multer';
import { ErrorHandler } from '../middlewares/error.js';

const fileTypes = {
  video: ['video/mp4', 'video/x-matroska'],
  image: ['image/jpg', 'image/jpeg', 'image/png'],
  document: ['application/pdf'],
};

const multerConfig = multer({
  fileFilter: (req, file, cb) => {
    let allowedTypes;
    switch (file.mimetype.split('/')[0]) {
      case 'video':
        allowedTypes = fileTypes.video;
        break;
      case 'image':
        allowedTypes = fileTypes.image;
        break;
      case 'document':
        allowedTypes = fileTypes.document;
        break;
      default:
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
    fileSize: 5 * 1024 * 1024, // 5MB
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
  { name: 'profile_picture', maxCount: 1 },
]);

export default fileHandlerMiddleware;
