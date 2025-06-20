import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import { FilesService } from './upload.service';
import { createFileUploadInterceptor } from 'src/commons/interceptors/file-upload.interceptor';
import { numbers } from 'src/commons/contants';

try {
  fs.readdirSync('uploads');
} catch (error) {
  fs.mkdirSync('uploads');
}

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('image')
  @UseInterceptors(createFileUploadInterceptor('image'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: numbers.MAX_IAMGE_SIZE }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): string {
    return this.filesService.getFileName(file);
  }
}
