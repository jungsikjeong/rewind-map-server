import { Injectable } from '@nestjs/common';
import * as path from 'path';

interface IFilesService {
  file: Express.Multer.File;
}

@Injectable()
export class FilesService {
  upload({ file }: IFilesService): string {
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      file.filename,
    );
    console.log('저장된 경로:', filePath);

    return '업로드 완료: ' + file.filename;
  }
}
