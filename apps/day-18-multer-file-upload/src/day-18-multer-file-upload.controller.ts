import {
  Controller,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlink } from 'node:fs/promises';
import { MAX_FILE_SIZE, UPLOAD_DIRECTORY } from './upload.constants';

interface UploadResponse {
  postId: string;
  originalName: string;
  size: number;
  storage: 'memory' | 'disk';
  hasBuffer: boolean;
}

@Controller('posts')
export class Day18MulterFileUploadController {
  @Post(':postId/cover/unsafe')
  @UseInterceptors(FileInterceptor('file'))
  uploadUnsafe(
    @Param('postId') postId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): UploadResponse {
    return this.describeUpload(postId, file, 'memory');
  }

  @Post(':postId/cover/validator')
  @UseInterceptors(FileInterceptor('file'))
  uploadWithValidator(
    @Param('postId') postId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
      }),
    )
    file: Express.Multer.File,
  ): UploadResponse {
    return this.describeUpload(postId, file, 'memory');
  }

  @Post(':postId/cover/safe')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: UPLOAD_DIRECTORY,
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async uploadSafe(
    @Param('postId') postId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<UploadResponse> {
    try {
      return this.describeUpload(postId, file, 'disk');
    } finally {
      await unlink(file.path);
    }
  }

  private describeUpload(
    postId: string,
    file: Express.Multer.File,
    storage: UploadResponse['storage'],
  ): UploadResponse {
    return {
      postId,
      originalName: file.originalname,
      size: file.size,
      storage,
      hasBuffer: Buffer.isBuffer(file.buffer),
    };
  }
}
