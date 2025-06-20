import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { numbers } from 'src/commons/contants';

export const createFileUploadInterceptor = (fieldName: string) => {
  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const originalName = file.originalname || 'file';
        const ext = path.extname(originalName) || '.jpg';
        cb(null, `${uuidv4()}${ext}`);
      },
    }),
    limits: {
      fileSize: numbers.MAX_IAMGE_SIZE,
    },
  });
};
