import { ErrorHandler } from '../middlewares/error.js';
import imageKit from '../config/imageKit.js';

export class ImageKitService {
  static async upload(files, folder, tags) {
    try {
      const uploadedFiles = {
        identity_type: null,
        profile_picture: null,
      };

      for (const [fileType, fileArray] of Object.entries(files)) {
        if (fileArray && fileArray.length > 0) {
          const file = fileArray[0];

          const split = file.originalname.split('.');
          const extension = split[split.length - 1];

          const uploadedFile = await imageKit.upload({
            folder,
            tags,
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
  }

  static async delete(fileID) {
    try {
      if (!fileID) {
        throw new ErrorHandler(400, 'File ID is required');
      }

      const result = await imageKit.deleteFile(fileID);

      return result;
    } catch (error) {
      throw new ErrorHandler(500, error.message);
    }
  }
}
