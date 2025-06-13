import { Module } from '@nestjs/common';
import { FilesController } from './upload.controller';
import { FilesService } from './upload.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
