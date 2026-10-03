import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { readdir } from 'node:fs/promises';
import type { Server } from 'node:http';
import request from 'supertest';
import { Day18MulterFileUploadModule } from './../src/day-18-multer-file-upload.module';
import { MAX_FILE_SIZE, UPLOAD_DIRECTORY } from './../src/upload.constants';

describe('Day18MulterFileUploadController (e2e)', () => {
  let app: INestApplication;

  const smallFile = Buffer.from('small cover image');
  const oversizedFile = Buffer.alloc(MAX_FILE_SIZE + 1);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day18MulterFileUploadModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function listTemporaryUploads(): Promise<string[]> {
    try {
      return (await readdir(UPLOAD_DIRECTORY)).sort();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }

  function getHttpServer(): Server {
    return app.getHttpServer() as Server;
  }

  it('keeps a small file in a Buffer in the unsafe version', async () => {
    await request(getHttpServer())
      .post('/posts/42/cover/unsafe')
      .attach('file', smallFile, {
        filename: 'cover.bin',
        contentType: 'application/octet-stream',
      })
      .expect(201)
      .expect({
        postId: '42',
        originalName: 'cover.bin',
        size: smallFile.length,
        storage: 'memory',
        hasBuffer: true,
      });
  });

  it('accepts a file larger than the safe limit in the unsafe version', async () => {
    await request(getHttpServer())
      .post('/posts/42/cover/unsafe')
      .attach('file', oversizedFile, {
        filename: 'large-cover.bin',
        contentType: 'application/octet-stream',
      })
      .expect(201)
      .expect({
        postId: '42',
        originalName: 'large-cover.bin',
        size: oversizedFile.length,
        storage: 'memory',
        hasBuffer: true,
      });
  });

  it('keeps a small file in a Buffer in the validator version', async () => {
    await request(getHttpServer())
      .post('/posts/42/cover/validator')
      .attach('file', smallFile, {
        filename: 'cover.bin',
        contentType: 'application/octet-stream',
      })
      .expect(201)
      .expect({
        postId: '42',
        originalName: 'cover.bin',
        size: smallFile.length,
        storage: 'memory',
        hasBuffer: true,
      });
  });

  it('rejects an oversized file only after Multer has received it in the validator version', async () => {
    await request(getHttpServer())
      .post('/posts/42/cover/validator')
      .attach('file', oversizedFile, {
        filename: 'large-cover.bin',
        contentType: 'application/octet-stream',
      })
      .expect(400)
      .expect({
        message: `Validation failed (current file size is ${oversizedFile.length}, expected size is less than ${MAX_FILE_SIZE})`,
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it('writes a small file to disk and removes the temporary file', async () => {
    const filesBeforeUpload = await listTemporaryUploads();

    await request(getHttpServer())
      .post('/posts/42/cover/safe')
      .attach('file', smallFile, {
        filename: 'cover.bin',
        contentType: 'application/octet-stream',
      })
      .expect(201)
      .expect({
        postId: '42',
        originalName: 'cover.bin',
        size: smallFile.length,
        storage: 'disk',
        hasBuffer: false,
      });

    expect(await listTemporaryUploads()).toEqual(filesBeforeUpload);
  });

  it('rejects an oversized file and removes its partial temporary file', async () => {
    const filesBeforeUpload = await listTemporaryUploads();

    await request(getHttpServer())
      .post('/posts/42/cover/safe')
      .attach('file', oversizedFile, {
        filename: 'large-cover.bin',
        contentType: 'application/octet-stream',
      })
      .expect(413)
      .expect({
        message: 'File too large',
        error: 'Payload Too Large',
        statusCode: 413,
      });

    expect(await listTemporaryUploads()).toEqual(filesBeforeUpload);
  });

  it.each(['unsafe', 'validator', 'safe'])(
    'rejects a missing file in the %s version',
    async (version) => {
      await request(getHttpServer())
        .post(`/posts/42/cover/${version}`)
        .expect(400);
    },
  );

  it('rejects a file with an unexpected field name', async () => {
    await request(getHttpServer())
      .post('/posts/42/cover/safe')
      .attach('cover', smallFile, 'cover.bin')
      .expect(400)
      .expect({
        message: 'Unexpected field - cover',
        error: 'Bad Request',
        statusCode: 400,
      });
  });
});
