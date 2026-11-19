import multer from 'multer'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export const vehicleImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error('Use a JPEG, PNG, WebP, or AVIF vehicle image.'))
    }
    callback(null, true)
  },
})
