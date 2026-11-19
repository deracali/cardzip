import { v2 as cloudinary } from 'cloudinary'

export function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    const error = new Error('Vehicle photo uploads are not configured. Set the Cloudinary credentials on the backend.')
    error.status = 503
    throw error
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  })
  return cloudinary
}

export function uploadVehicleImage(file) {
  const client = configureCloudinary()
  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream({
      resource_type: 'image',
      folder: 'voltigo/vehicles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      transformation: [{ width: 1800, height: 1200, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }],
    }, (error, result) => {
      if (error) return reject(error)
      if (!result?.secure_url) return reject(new Error('Cloudinary returned no secure image URL.'))
      resolve({ url: result.secure_url, publicId: result.public_id })
    })
    stream.end(file.buffer)
  })
}

export function isVoltigoCloudinaryImage(url) {
  try {
    const image = new URL(url)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    return Boolean(cloudName
      && image.protocol === 'https:'
      && image.hostname === 'res.cloudinary.com'
      && image.pathname.startsWith(`/${cloudName}/image/upload/`))
  } catch {
    return false
  }
}
