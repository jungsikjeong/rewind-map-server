import { Module } from '@nestjs/common';
import { FilesController } from './upload.controller';
import { FilesService } from './upload.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
