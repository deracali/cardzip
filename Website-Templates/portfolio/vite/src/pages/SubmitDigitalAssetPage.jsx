import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock3, UploadCloud } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import { formatNaira } from '../utils/currency'
import './DigitalAssets.css'

const MAX_SCREENSHOTS = 20
const MAX_IMAGE_SIZE = 8 * 1024 * 1024
const listingTypes = [
  { value: 'website', label: 'Website' },
  { value: 'app', label: 'Android app' },
  { value: 'ios_app', label: 'iOS app' },
]

const statusLabel = (status) => ({
  pending_review: 'In review',
  approved: 'Approved',
  rejected: 'Changes requested',
}[status] || status)

export default function SubmitDigitalAssetPage({ onNavigate }) {
  const [type, setType] = useState('website')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [contact, setContact] = useState('')
  const [price, setPrice] = useState('')
  const [sourceCodeFile, setSourceCodeFile] = useState(null)
  const [photos, setPhotos] = useState([])
  const [photoNames, setPhotoNames] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [uploadProgress, setUploadProgress] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!getUserToken()) return
    userApi.myDigitalAssets()
      .then((result) => setSubmissions(result.data || []))
      .catch((requestError) => setError(requestError.message || 'Could not load your submissions.'))
  }, [])

  const choosePhotos = (event) => {
    const selected = [...(event.target.files || [])]
    event.target.value = ''
    if (photos.length + selected.length > MAX_SCREENSHOTS) {
      setError(`Add no more than ${MAX_SCREENSHOTS} screenshots.`)
      return
    }
    if (selected.some((file) => !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > MAX_IMAGE_SIZE)) {
      setError('Each screenshot must be a JPEG, PNG, WebP, or AVIF image up to 8 MB.')
      return
    }
    setPhotos((current) => [...current, ...selected])
    setPhotoNames((current) => [...current, ...selected.map((file) => file.name)])
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent('/digital-assets/sell')}`)
      return
    }
    if (photos.length < 10) {
      setError('Add at least 10 screenshots before submitting your listing.')
      return
    }
    if (!sourceCodeFile) {
      setError('Choose the website or app source-code ZIP before submitting.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const uploadedPhotos = []
      for (let index = 0; index < photos.length; index += 1) {
        setUploadProgress(`Uploading screenshot ${index + 1} of ${photos.length}…`)
        const result = await userApi.uploadSellerDigitalAssetImage(photos[index])
        if (!result.data?.url) throw new Error(`Screenshot ${index + 1} did not return a saved URL.`)
        uploadedPhotos.push(result.data.url)
      }
      setUploadProgress('Uploading source-code ZIP…')
      const sourceResult = await userApi.uploadSellerDigitalAssetSourceCode(sourceCodeFile)
      if (!sourceResult.data?.sourceCodeUrl) throw new Error('The source-code upload did not return a saved URL.')
      const result = await userApi.createSellerDigitalAsset({
        name,
        productType: type,
        category,
        description,
        price: Number(price),
        sellerContact: contact,
        sourceCodeUrl: sourceResult.data.sourceCodeUrl,
        ...(type === 'website' ? { websiteUrl: url } : {
          ...(websiteUrl.trim() ? { websiteUrl: websiteUrl.trim() } : {}),
          ...(type === 'app' ? { apkUrl: url } : { iosAppUrl: url }),
        }),
        screenshots: uploadedPhotos,
      })
      setSubmissions((current) => [result.data, ...current])
      setName('')
      setCategory('')
      setDescription('')
      setUrl('')
      setWebsiteUrl('')
      setContact('')
      setPrice('')
      setSourceCodeFile(null)
      setPhotos([])
      setPhotoNames([])
      setNotice('Your listing and source-code ZIP are submitted for review. Approval takes 1–3 business days; it appears in the marketplace only after an admin approves it.')
    } catch (submitError) {
      setError(submitError.message || 'Could not submit your listing.')
    } finally {
      setSaving(false)
      setUploadProgress('')
    }
  }

  return (
    <main className="digital-assets-page">
      <div className="digital-assets-shell">
        <button type="button" className="digital-back-link" onClick={() => onNavigate?.('/digital-assets')}><ArrowLeft size={15} /> Back to websites and apps</button>
        <header className="digital-submit-heading">
          <span className="digital-assets-kicker">SELL WITH CARDZIP</span>
          <h1>List your website or app</h1>
          <p>Submit your app or website together with its source-code ZIP. Admin approval takes 1–3 business days. We publish only after reviewing the listing and verifying its source code.</p>
        </header>
        <div className="digital-seller-payout-note"><Clock3 size={19} /><span><strong>Your seller share is 70% of each successful sale.</strong> Cardzip retains 30%. Your share is credited to your Cardzip wallet and can be withdrawn using the usual withdrawal flow. Digital-listing withdrawals take 1–2 business days to process.</span></div>
        <form className="digital-submit-form" onSubmit={submit}>
          <div className="digital-listing-type" role="group" aria-label="Digital listing type">
            {listingTypes.map((item) => <button type="button" key={item.value} className={type === item.value ? 'active' : ''} onClick={() => {
              if (type !== item.value) {
                setType(item.value)
                setUrl('')
                if (item.value === 'website') setWebsiteUrl('')
              }
            }}>{item.label}</button>)}
          </div>
          <div className="digital-submit-fields">
            <label>Listing name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} placeholder="Name your website or app" /></label>
            <label>Category<input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={80} placeholder="e.g. Education, productivity" /></label>
            <label className="wide">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} required maxLength={5000} rows={4} placeholder="Describe features and what the buyer gets." /></label>
            <label className="wide">{type === 'website' ? 'Website URL' : type === 'app' ? 'Android APK download URL' : 'iOS app access URL'}<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} required placeholder="https://…" /></label>
            {type !== 'website' && <label className="wide">Website URL (optional)<input type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://your-app-website.com" /></label>}
            <label>Contact details for Cardzip review<input value={contact} onChange={(event) => setContact(event.target.value)} required maxLength={120} placeholder="Email or phone (not shown to buyers)" /><small>This contact information is kept private and is not displayed to buyers.</small></label>
            <label>Sale price (NGN)<input type="number" min="100" max="5000000" step="1" value={price} onChange={(event) => setPrice(event.target.value)} required placeholder="Minimum ₦100" /><small>{Number(price) >= 100 ? `You receive ${formatNaira(Math.floor(Number(price) * 0.7))} after a successful payment.` : 'You receive 70% after a successful payment.'}</small></label>
          </div>
          <label className="digital-screenshot-picker"><UploadCloud size={19} /><strong>Website or app source code (ZIP)</strong><span>Required for review. Buyers can download it only after admin approval and successful payment. Maximum 100 MB.</span><input type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={saving} onChange={(event) => { const file = event.target.files?.[0] || null; event.target.value = ''; if (file && (file.size > 100 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.zip'))) { setError('Choose a ZIP archive up to 100 MB.'); setSourceCodeFile(null); return } setSourceCodeFile(file); setError('') }} /><b>{sourceCodeFile?.name || 'No source-code archive selected'}</b></label>
          <label className="digital-screenshot-picker"><UploadCloud size={19} /><strong>App or website screenshots</strong><span>Select 10–20 images. Buyers can view the full gallery only after payment; each image must be 8 MB or smaller.</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={choosePhotos} disabled={saving} /><b>{photos.length} of {MAX_SCREENSHOTS} selected · {photos.length < 10 ? `${10 - photos.length} more required` : 'Minimum met'}</b></label>
          {photoNames.length > 0 && <div className="digital-screenshot-preview">{photoNames.map((photoName, index) => <span key={`${photoName}-${index}`}>{index + 1}. {photoName}</span>)}</div>}
          {error && <p className="digital-assets-error" role="alert">{error}</p>}
          {notice && <p className="digital-submit-success" role="status">{notice}</p>}
          {uploadProgress && <p className="digital-assets-state" role="status">{uploadProgress}</p>}
          <button className="digital-submit-button" type="submit" disabled={saving}>{saving ? 'Submitting listing…' : 'Submit for review'} <ArrowRight size={16} /></button>
        </form>
        <section className="digital-my-submissions">
          <h2>Your submissions</h2>
          {submissions.length === 0 ? <p>Your listing review status will appear here.</p> : submissions.map((item) => (
            <article key={item._id}><span><strong>{item.name}</strong><small>{item.productType} · {formatNaira(item.price)}</small>{item.sellerReviewNote && <small>{item.sellerReviewNote}</small>}</span><b className={`digital-review-status ${item.sellerListingStatus}`}>{statusLabel(item.sellerListingStatus)}</b></article>
          ))}
        </section>
      </div>
    </main>
  )
}
