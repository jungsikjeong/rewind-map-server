import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface IFilesService {
  file: Express.Multer.File;
}

@Injectable()
export class FilesService {
  private readonly storage = diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = {} as Request;
      this.storage._handleFile(req, file, (err, info) => {
        if (err) {
          reject(err);
          return;
        }
        if (!info || !info.filename) {
          reject(new Error('파일 업로드 실패'));
          return;
        }
        resolve(info.filename);
      });
    });
  }

  upload({ file }: IFilesService): string {
    return file.filename;
  }
}
