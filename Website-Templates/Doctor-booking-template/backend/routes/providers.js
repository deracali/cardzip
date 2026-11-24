import { Router } from 'express'
import Doctor from '../src/models/Doctor.js'
import { requireRole, requireUser } from '../src/middleware/auth.js'

const router = Router()
const imageDataPattern = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/
const timePattern = /^\d{1,2}:\d{2}\s?(?:AM|PM)$/i

function isText(value, maxLength, required = false) {
  return typeof value === 'string'
    && value.length <= maxLength
    && (!required || value.trim().length > 0)
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'provider'
}

router.use(requireUser, requireRole('provider'))

router.get('/profile', async (request, response) => {
  const profile = request.user.providerDoctor
    ? await Doctor.findOne({ _id: request.user.providerDoctor, providerUser: request.user._id }).lean()
    : null
  response.json({ profile })
})

router.put('/profile', async (request, response) => {
  const {
    name, image, specialty, credentials, location, fee, experience, bio, education, availability,
  } = request.body ?? {}
  const allowedFields = ['name', 'image', 'specialty', 'credentials', 'location', 'fee', 'experience', 'bio', 'education', 'availability']
  if (Object.keys(request.body ?? {}).some((key) => !allowedFields.includes(key))
    || !isText(name, 120, true)
    || !isText(specialty, 80, true)
    || !isText(credentials, 100)
    || !isText(location, 120, true)
    || !isText(experience, 40, true)
    || !isText(bio, 1200, true)
    || !isText(education, 240, true)
    || !Number.isFinite(fee) || fee < 0 || fee > 10000
    || typeof image !== 'string' || image.length > 2100000 || !imageDataPattern.test(image)
    || !Array.isArray(availability) || availability.length < 1 || availability.length > 12
    || availability.some((time) => typeof time !== 'string' || time.length > 20 || !timePattern.test(time))) {
    return response.status(400).json({ error: 'Complete the required doctor details and upload a JPG, PNG, or WebP profile photo no larger than 1.5 MB.' })
  }

  let profile = request.user.providerDoctor
    ? await Doctor.findOne({ _id: request.user.providerDoctor, providerUser: request.user._id })
    : null
  if (request.user.providerDoctor && !profile) {
    return response.status(409).json({ error: 'Your assigned doctor profile could not be found. Contact the Carewell team.' })
  }

  if (!profile) {
    const baseSlug = slugify(name)
    let slug = baseSlug
    if (await Doctor.exists({ slug })) slug = `${baseSlug.slice(0, 51)}-${request.user._id.toString().slice(-8)}`
    profile = new Doctor({
      slug,
      providerUser: request.user._id,
      active: false,
      rating: 0,
      reviews: 0,
    })
    request.user.providerDoctor = profile._id
  }

  Object.assign(profile, {
    name: name.trim(),
    image,
    specialty: specialty.trim(),
    credentials: credentials.trim(),
    location: location.trim(),
    fee,
    experience: experience.trim(),
    bio: bio.trim(),
    education: education.trim(),
    availability: availability.map((time) => time.trim()),
  })
  await profile.save()
  if (request.user.providerStatus === 'rejected') request.user.providerStatus = 'pending'
  await request.user.save()
  return response.json({ profile, providerStatus: request.user.providerStatus })
})

export default router
