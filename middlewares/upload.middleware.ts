import multer from 'multer';

const memoryStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const imageExtension = file.mimetype.split('/')[1];
    const filename = `${Date.now()}-${Date.now()}.${imageExtension}`;
    const fileUrl = `${process.env.APP_URL}/uploads/${filename}`;
    req.body.fileUrl = fileUrl;
    req.body.file = filename;
    cb(null, filename);
  },
});

const uploadMemory = multer({
  storage: memoryStorage,
});

const uploadDisk = multer({
  storage: diskStorage,
  // limits: { fileSize: 1024 * 1024 * 5 },  // 5MB
});

export { uploadMemory, uploadDisk };
