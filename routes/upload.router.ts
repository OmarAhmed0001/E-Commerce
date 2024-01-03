import { Router } from 'express';

import {
  uploadFile,
  uploadFiles,
  uploadImage,
} from '../controllers/upload.controller';
import { uploadDisk, uploadMemory } from '../middlewares/upload.middleware';
import { protectedMiddleware } from '../middlewares/protected.middleware';

const uploadRouter = Router();

uploadRouter
  .route('/image?')
  .post(protectedMiddleware, uploadMemory.single('image'), uploadImage);

uploadRouter
  .route('/file')
  .post(protectedMiddleware, uploadDisk.single('file'), uploadFile);

uploadRouter
  .route('/files')
  .post(protectedMiddleware, uploadDisk.array('files'), uploadFiles);

export default uploadRouter;
