import { SetMetadata } from '@nestjs/common';

export const FileLimit = (limit: number) => SetMetadata('fileLimit', limit);
