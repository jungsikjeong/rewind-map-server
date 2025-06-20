import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  getFileName(file: Express.Multer.File): string {
    return file.filename;
  }
}
