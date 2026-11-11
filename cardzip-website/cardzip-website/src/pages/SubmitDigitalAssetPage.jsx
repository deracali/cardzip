import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock3, UploadCloud } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import { formatNaira } from '../utils/currency'
import './DigitalAssets.css'

const MAX_SCREENSHOTS = 20
const MAX_IMAGE_SIZE = 8 * 1024 * 1024
const MAX_BUYER_DOCUMENTS = 10
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024
const listingTypes = [
  { value: 'website', label: 'Website' },
  { value: 'app', label: 'Android app' },
  { value: 'ios_app', label: 'iOS app' },
  { value: 'full_stack', label: 'Full stack' },
  { value: 'admin', label: 'Admin dashboard' },
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
  const [contact, setContact] = useState('')
  const [usePrice, setUsePrice] = useState('')
  const [templatePrice, setTemplatePrice] = useState('')
  const [sourceCodeFile, setSourceCodeFile] = useState(null)
  const [templateSourceCodeFile, setTemplateSourceCodeFile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [templateDocuments, setTemplateDocuments] = useState([])
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
    const prices = [usePrice, templatePrice].map((value) => Number(value || 0))
    if (prices.some((value) => !Number.isSafeInteger(value) || value < 0 || value > 5000000)
      || prices.some((value) => value > 0 && value < 100)
      || prices.every((value) => value === 0)) {
      setError('Set at least one whole-naira rental or full-template price between ₦100 and ₦5,000,000.')
      return
    }
    if (![usePrice, templatePrice].some((value) => Number(value) >= 100)) {
      setError('Enter a rental/use price, a full-template price, or both.')
      return
    }
    if (Number(usePrice) > 0 && !sourceCodeFile) {
      setError('Choose the rental/use source-code ZIP for the use option.')
      return
    }
    if (Number(templatePrice) > 0 && !templateSourceCodeFile) {
      setError('Choose the full-template source-code ZIP for the template option.')
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
      const uploadArchive = async (file, label) => {
        if (!file) return {}
        setUploadProgress(`Uploading ${label} source-code ZIP…`)
        const result = await userApi.uploadSellerDigitalAssetSourceCode(file)
        if (!result.data?.sourceCodeUrl) throw new Error(`The ${label} source-code upload did not return a saved URL.`)
        return {
          sourceCodeUrl: result.data.sourceCodeUrl,
          sourceCodeCloudinaryUrl: result.data.sourceCodeCloudinaryUrl || '',
        }
      }
      const rentalArchive = await uploadArchive(sourceCodeFile, 'rental')
      const templateArchive = await uploadArchive(templateSourceCodeFile, 'full-template')
      const uploadDocuments = async (files, label) => {
        const uploaded = []
        for (const [index, file] of files.entries()) {
          setUploadProgress(`Uploading ${label} document ${index + 1} of ${files.length}…`)
          const result = await userApi.uploadSellerDigitalAssetDocument(file)
          if (!result.data?.document?.url) throw new Error(`${file.name} did not return a saved document.`)
          uploaded.push(result.data.document)
        }
        return uploaded
      }
      const uploadedDocuments = await uploadDocuments(documents, 'buyer')
      const uploadedTemplateDocuments = await uploadDocuments(templateDocuments, 'full-template legal')
      const result = await userApi.createSellerDigitalAsset({
        name,
        productType: type,
        category,
        description,
        price: prices[0] || prices[1],
        usePrice: prices[0],
        templatePrice: prices[1],
        sellerContact: contact,
        ...rentalArchive,
        ...(templateArchive.sourceCodeUrl ? {
          templateSourceCodeUrl: templateArchive.sourceCodeUrl,
          templateSourceCodeCloudinaryUrl: templateArchive.sourceCodeCloudinaryUrl,
        } : {}),
        documents: uploadedDocuments,
        templateDocuments: uploadedTemplateDocuments,
        ...(type === 'website' || type === 'full_stack' || type === 'admin'
          ? { websiteUrl: url }
          : type === 'app'
            ? { apkUrl: url }
            : { iosAppUrl: url }),
        screenshots: uploadedPhotos,
      })
      setSubmissions((current) => [result.data, ...current])
      setName('')
      setCategory('')
      setDescription('')
      setUrl('')
      setContact('')
      setUsePrice('')
      setTemplatePrice('')
      setSourceCodeFile(null)
      setTemplateSourceCodeFile(null)
      setDocuments([])
      setTemplateDocuments([])
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
          <p>Submit your website, app, full-stack project, or admin dashboard with separate rental and full-template options. Admin approval takes 1–3 business days.</p>
        </header>
        <div className="digital-seller-payout-note"><Clock3 size={19} /><span><strong>Your seller share is 70% of each successful sale.</strong> Cardzip retains 30%. Your share is credited to your Cardzip wallet and can be withdrawn using the usual withdrawal flow. Digital-listing withdrawals take 1–2 business days to process.</span></div>
        <form className="digital-submit-form" onSubmit={submit}>
          <div className="digital-listing-type" role="group" aria-label="Digital listing type">
            {listingTypes.map((item) => <button type="button" key={item.value} className={type === item.value ? 'active' : ''} onClick={() => {
              if (type !== item.value) {
                setType(item.value)
                setUrl('')
              }
            }}>{item.label}</button>)}
          </div>
          <div className="digital-submit-fields">
            <label>Listing name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} placeholder="Name your website or app" /></label>
            <label>Category<input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={80} placeholder="e.g. Education, productivity" /></label>
            <label className="wide">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} required maxLength={5000} rows={4} placeholder="Describe features and what the buyer gets." /></label>
            <label className="wide">{type === 'website' || type === 'full_stack' || type === 'admin' ? 'Website URL' : type === 'app' ? 'Android APK download URL' : 'iOS app access URL'}<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} required placeholder="https://…" /></label>
            <label>Contact details for Cardzip review<input value={contact} onChange={(event) => setContact(event.target.value)} required maxLength={120} placeholder="Email or phone (not shown to buyers)" /><small>This contact information is kept private and is not displayed to buyers.</small></label>
            <label>Rental / use price (NGN)<input type="number" min="100" max="5000000" step="1" value={usePrice} onChange={(event) => setUsePrice(event.target.value)} placeholder="Optional · minimum ₦100" /><small>{Number(usePrice) >= 100 ? `You receive ${formatNaira(Math.floor(Number(usePrice) * 0.7))} after payment.` : 'Optional; pays you 70% per successful purchase.'}</small></label>
            <label>Full-template price (NGN)<input type="number" min="100" max="5000000" step="1" value={templatePrice} onChange={(event) => setTemplatePrice(event.target.value)} placeholder="Optional · minimum ₦100" /><small>{Number(templatePrice) >= 100 ? `You receive ${formatNaira(Math.floor(Number(templatePrice) * 0.7))} after payment.` : 'Optional; includes the full project and its legal documents.'}</small></label>
          </div>
          {Number(usePrice) > 0 && <label className="digital-screenshot-picker"><UploadCloud size={19} /><strong>Rental / use source code (ZIP)</strong><span>Required when you offer rental/use. Buyers can download it after approval and payment. Maximum 100 MB.</span><input type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={saving} onChange={(event) => { const file = event.target.files?.[0] || null; event.target.value = ''; if (file && (file.size > 100 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.zip'))) { setError('Choose a ZIP archive up to 100 MB.'); setSourceCodeFile(null); return } setSourceCodeFile(file); setError('') }} /><b>{sourceCodeFile?.name || 'No rental source ZIP selected'}</b></label>}
          {Number(templatePrice) > 0 && <label className="digital-screenshot-picker"><UploadCloud size={19} /><strong>Full-template source code (ZIP)</strong><span>Required when you offer the full template. Maximum 100 MB.</span><input type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={saving} onChange={(event) => { const file = event.target.files?.[0] || null; event.target.value = ''; if (file && (file.size > 100 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.zip'))) { setError('Choose a ZIP archive up to 100 MB.'); setTemplateSourceCodeFile(null); return } setTemplateSourceCodeFile(file); setError('') }} /><b>{templateSourceCodeFile?.name || 'No full-template source ZIP selected'}</b></label>}
          <label className="digital-screenshot-picker"><UploadCloud size={19} /><strong>Buyer files for rental / use</strong><span>Optional. Add up to {MAX_BUYER_DOCUMENTS} files, 20 MB each.</span><input type="file" multiple disabled={saving} onChange={(event) => { const selected = [...(event.target.files || [])]; event.target.value = ''; if (documents.length + selected.length > MAX_BUYER_DOCUMENTS || selected.some((file) => file.size > MAX_DOCUMENT_SIZE)) { setError('Add no more than 10 buyer files, up to 20 MB each.'); return } setDocuments((current) => [...current, ...selected]) }} /><b>{documents.length} of {MAX_BUYER_DOCUMENTS} selected</b></label>
          {documents.length > 0 && <div className="digital-screenshot-preview">{documents.map((file, index) => <span key={`${file.name}-${index}`}>{file.name}</span>)}</div>}
          <label className="digital-screenshot-picker"><UploadCloud size={19} /><strong>Full-template legal documents</strong><span>Optional. Buyers who purchase the full template can download these files.</span><input type="file" multiple disabled={saving} onChange={(event) => { const selected = [...(event.target.files || [])]; event.target.value = ''; if (templateDocuments.length + selected.length > MAX_BUYER_DOCUMENTS || selected.some((file) => file.size > MAX_DOCUMENT_SIZE)) { setError('Add no more than 10 legal documents, up to 20 MB each.'); return } setTemplateDocuments((current) => [...current, ...selected]) }} /><b>{templateDocuments.length} of {MAX_BUYER_DOCUMENTS} selected</b></label>
          {templateDocuments.length > 0 && <div className="digital-screenshot-preview">{templateDocuments.map((file, index) => <span key={`${file.name}-${index}`}>{file.name}</span>)}</div>}
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
            <article key={item._id}><span><strong>{item.name}</strong><small>{item.productType} · Use {formatNaira(item.usePrice || item.price)}{Number(item.templatePrice) > 0 ? ` · Full template ${formatNaira(item.templatePrice)}` : ''}</small>{item.sellerReviewNote && <small>{item.sellerReviewNote}</small>}{item.moderationStatus === 'suspended' && <small className="digital-moderation-reason">Hidden by Cardzip: {item.moderationReason || 'This listing is temporarily unavailable.'}</small>}</span><b className={`digital-review-status ${item.moderationStatus === 'suspended' ? 'suspended' : item.sellerListingStatus}`}>{item.moderationStatus === 'suspended' ? 'Suspended' : statusLabel(item.sellerListingStatus)}</b></article>
          ))}
        </section>
      </div>
    </main>
  )
}
