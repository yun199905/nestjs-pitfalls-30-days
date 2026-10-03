import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const MAX_FILE_SIZE = 1024 * 1024;
export const UPLOAD_DIRECTORY = join(tmpdir(), 'nestjs-day18-file-upload');
