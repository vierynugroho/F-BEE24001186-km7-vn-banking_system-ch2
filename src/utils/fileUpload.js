import imageKit from '../config/imageKit.js';
import { ErrorHandler } from '../middlewares/error.js';

const handleUpload = async (files) => {
  const uploadedFiles = {
    identity_type: null,
    profile_picture: null,
  };

  try {
    for (const [fileType, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];

        const split = file.originalname.split('.');
        const extension = split[split.length - 1];

        const uploadedFile = await imageKit.upload({
          folder: 'users_data',
          tags: ['users'],
          file: file.buffer,
          fileName: `${fileType}-${Date.now()}.${extension}`,
        });

        uploadedFiles[fileType] = uploadedFile;
      }
    }

    return uploadedFiles;
  } catch (error) {
    throw new ErrorHandler(500, error.message);
  }
};

export default handleUpload;
