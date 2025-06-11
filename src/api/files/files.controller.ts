import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { basename, extname } from 'path';
import { numbers } from 'src/commons/contants';
import { Public } from '../auth/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

try {
  fs.readdirSync('uploads');
} catch (error) {
  fs.mkdirSync('uploads');
}

@Controller('file')
export class FilesController {
  @UseInterceptors(
    FilesInterceptor('images', numbers.MAX_IMAGES_COUNT, {
      storage: diskStorage({
        destination(req, file, cb) {
          cb(null, 'uploads/');
        },
        filename(req, file, cb) {
          const ext = extname(file.originalname);
          cb(null, basename(file.originalname, ext) + Date.now() + ext);
        },
      }),
      limits: { fileSize: numbers.MAX_IAMGE_SIZE },
    }),
  )
  @Post('/images')
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const uris = files.map((file) => file.filename);

    return uris;
  }

  @Post('/image')
  @UseInterceptors(
    FilesInterceptor('image', numbers.MAX_IMAGE_COUNT, {
      storage: diskStorage({
        destination(req, file, cb) {
          cb(null, 'uploads/');
        },
        filename(req, file, cb) {
          const ext = extname(file.originalname);
          cb(null, basename(file.originalname, ext) + Date.now() + ext);
        },
      }),
      limits: { fileSize: numbers.MAX_IAMGE_SIZE },
    }),
  )
  @UseGuards(AuthGuard())
  uploadImage(@UploadedFiles() file: Express.Multer.File) {
    console.log(file);

    return file.filename;
  }
}
