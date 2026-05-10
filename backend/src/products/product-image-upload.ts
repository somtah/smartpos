import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export function productUploadRoot(): string {
  return join(process.cwd(), 'uploads', 'products');
}

export function ensureProductUploadDir(): void {
  const dir = productUploadRoot();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export const productImageMulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      ensureProductUploadDir();
      cb(null, productUploadRoot());
    },
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname || '').toLowerCase();
      const safeExt = ext && ext.length <= 8 ? ext : '.jpg';
      cb(null, `${randomUUID()}${safeExt}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new BadRequestException('Only image uploads are allowed') as Error, false);
      return;
    }
    cb(null, true);
  },
};
