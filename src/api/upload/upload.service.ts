import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  getFileName(file: Express.Multer.File): string {
    return file.filename;
  }

  deleteFile(filename: string): void {
    fs.unlinkSync(`./uploads/${filename}`);
  }
}
