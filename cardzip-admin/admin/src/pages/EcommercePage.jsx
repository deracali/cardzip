import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, ChevronDown, FileText, ImagePlus, MapPin, Package, Pencil, Plus, Search, ShoppingBag, Sparkles, Trash2, Upload, X } from 'lucide-react'
import { adminApi } from '../services/api'
import CustomSelect from '../components/CustomSelect'

const emptyProduct = {
  name: '',
  productType: 'product',
  category: '',
  description: '',
  expectedDelivery: '',
  keyHighlights: [''],
  specifications: [{ label: '', value: '' }],
  colors: [],
  packagingDetails: '',
  price: '',
  discountPercent: '',
  sourceCodeUrl: '',
  sourceCodeCloudinaryUrl: '',
  templateSourceCodeUrl: '',
  templateSourceCodeCloudinaryUrl: '',
  documents: [],
  templateDocuments: [],
  websiteUrl: '',
  apkUrl: '',
  iosAppUrl: '',
  usageInstructions: '',
  usePrice: '',
  templatePrice: '',
  condition: 'brand_new',
  isSold: false,
  image: '',
  images: [''],
  stock: '0',
  tags: '',
  isActive: true,
}

const productTypeOptions = [
  { value: 'product', label: 'Physical product', description: 'A shippable item in the store.' },
  { value: 'website', label: 'Web', description: 'A live website with use and template options.' },
  { value: 'app', label: 'Android app', description: 'An Android app with a hosted APK.' },
  { value: 'ios_app', label: 'iOS app', description: 'An iOS app with a hosted access link.' },
  { value: 'full_stack', label: 'Full stack', description: 'A full-stack web application with backend and setup options.' },
  { value: 'admin', label: 'Admin', description: 'An admin dashboard with hosted access and setup options.' },
]

const formatNaira = (amount) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(Number(amount || 0))

const formatStatus = (status) => String(status || 'processing')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase())

const productImages = (item) => [...new Set([
  item.image,
  ...(Array.isArray(item.images) ? item.images : []),
].filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim()))]

const truncateProductText = (value, maxLength) => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}

const legacyColorValues = {
  black: '#111827',
  blue: '#2563eb',
  'midnight blue': '#172554',
  midnight: '#111827',
  white: '#ffffff',
  silver: '#cbd5e1',
  green: '#16a34a',
  graphite: '#475569',
  sand: '#d6c4a1',
  red: '#dc2626',
  gold: '#d4af37',
  pink: '#ec4899',
  purple: '#7c3aed',
  gray: '#94a3b8',
  grey: '#94a3b8',
  navy: '#1e3a8a',
}

const normalizeProductColor = (color) => {
  const value = String(color || '').trim()
  if (/^#(?:[\da-f]{3}){1,2}$/i.test(value)) return value
  return legacyColorValues[value.toLowerCase()] || '#94a3b8'
}

export default function EcommercePage({ section = 'orders', onViewOrder }) {
  const activeSection = section
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ totalStoreVolume: 0, pendingDispatch: 0, activeProducts: 0, lowStockProducts: 0 })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [product, setProduct] = useState(emptyProduct)
  const [productTypeOpen, setProductTypeOpen] = useState(false)
  const [aiStatus, setAiStatus] = useState('')
  const [generatingProductDetails, setGeneratingProductDetails] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null)
  const [uploadingSourceCode, setUploadingSourceCode] = useState(false)
  const [uploadingTemplateSourceCode, setUploadingTemplateSourceCode] = useState(false)
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  const [documentUploadFeedback, setDocumentUploadFeedback] = useState([])
  const [productError, setProductError] = useState('')
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [products, setProducts] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [addingProductCategory, setAddingProductCategory] = useState(false)
  const [productPagination, setProductPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [productPage, setProductPage] = useState(1)
  const [productSearch, setProductSearch] = useState('')
  const [productStatus, setProductStatus] = useState('all')
  const [productStatusOpen, setProductStatusOpen] = useState(false)
  const productStatusRef = useRef(null)
  const generateOnNameChange = useRef(false)
  const productContentRevision = useRef(0)
  const requestedContentRevision = useRef(0)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [deletingProductId, setDeletingProductId] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [shopApplications, setShopApplications] = useState([])
  const [shopApplicationsPagination, setShopApplicationsPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [shopApplicationsLoading, setShopApplicationsLoading] = useState(false)
  const [shopApplicationsError, setShopApplicationsError] = useState('')
  const [shopApplicationStatus, setShopApplicationStatus] = useState('pending')
  const [shopApplicationPage, setShopApplicationPage] = useState(1)
  const [reviewingShopId, setReviewingShopId] = useState('')
  const [shopReviewTarget, setShopReviewTarget] = useState(null)
  const [shopReviewNote, setShopReviewNote] = useState('')
  const [digitalSubmissions, setDigitalSubmissions] = useState([])
  const [digitalSubmissionsPagination, setDigitalSubmissionsPagination] = useState({ page: 1, totalPages: 0, totalItems: 0 })
  const [digitalSubmissionPage, setDigitalSubmissionPage] = useState(1)
  const [digitalSubmissionsLoading, setDigitalSubmissionsLoading] = useState(false)
  const [digitalSubmissionsError, setDigitalSubmissionsError] = useState('')
  const [digitalSubmissionStatus, setDigitalSubmissionStatus] = useState('pending_review')
  const [reviewingDigitalAssetId, setReviewingDigitalAssetId] = useState('')
  const [uploadingDigitalSourceId, setUploadingDigitalSourceId] = useState('')
  const [adPlacements, setAdPlacements] = useState([])
  const [adCampaigns, setAdCampaigns] = useState([])
  const [adSettingsLoading, setAdSettingsLoading] = useState(false)
  const [adSettingsError, setAdSettingsError] = useState('')
  const [savingPlacementKey, setSavingPlacementKey] = useState('')
  const [reviewingCampaignId, setReviewingCampaignId] = useState('')
  const [adCampaignStatus, setAdCampaignStatus] = useState('pending_review')
  const [adCampaignPagination, setAdCampaignPagination] = useState({ page: 1, totalPages: 0, totalItems: 0 })
  const [adCampaignPage, setAdCampaignPage] = useState(1)
  const [communityPromotionPrices, setCommunityPromotionPrices] = useState([
    { key: 'day', label: '1 day', days: 1, price: '' },
    { key: 'week', label: '1 week', days: 7, price: '' },
    { key: 'month', label: '1 month', days: 30, price: '' },
  ])
  const [communityPromotions, setCommunityPromotions] = useState([])
  const [communityPromotionPagination, setCommunityPromotionPagination] = useState({ page: 1, totalPages: 0, totalItems: 0 })
  const [communityPromotionPage, setCommunityPromotionPage] = useState(1)
  const [savingCommunityPrices, setSavingCommunityPrices] = useState(false)
  const [reviewingPromotionId, setReviewingPromotionId] = useState('')

  useEffect(() => {
    if (activeSection !== 'orders') return undefined
    let active = true
    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(pagination.page), limit: '10' })
      if (search.trim()) query.set('search', search.trim())
      setLoading(true)
      setError('')
      adminApi.storeDashboard(`?${query.toString()}`)
        .then((result) => {
          if (!active) return
          const dashboard = result?.data
          if (!dashboard || !Array.isArray(dashboard.orders) || !dashboard.stats || !dashboard.pagination) {
            throw new Error('The e-commerce dashboard returned an invalid response. Please refresh or contact support.')
          }
          setOrders(dashboard.orders)
          setStats({
            totalStoreVolume: Number(dashboard.stats.totalStoreVolume) || 0,
            pendingDispatch: Number(dashboard.stats.pendingDispatch) || 0,
            activeProducts: Number(dashboard.stats.activeProducts) || 0,
            lowStockProducts: Number(dashboard.stats.lowStockProducts) || 0,
          })
          setPagination(dashboard.pagination)
        })
        .catch((requestError) => { if (active) setError(requestError.message) })
        .finally(() => { if (active) setLoading(false) })
    }, search ? 300 : 0)
    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [activeSection, pagination.page, search, refreshKey])

  useEffect(() => {
    if (activeSection !== 'products') return undefined
    let active = true
    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(productPage), limit: '10' })
      if (productSearch.trim()) query.set('search', productSearch.trim())
      if (productStatus !== 'all') query.set('status', productStatus)
      setProductsLoading(true)
      setProductsError('')
      adminApi.storeProducts(`?${query.toString()}`)
        .then((result) => {
          if (!active) return
          const nextPagination = result.pagination || { page: productPage, totalPages: 1, totalItems: 0 }
          setProducts(result.data || [])
          setProductCategories(Array.isArray(result.categories) ? result.categories : [])
          setProductPagination(nextPagination)
          if (productPage > nextPagination.totalPages) setProductPage(nextPagination.totalPages)
        })
        .catch((requestError) => { if (active) setProductsError(requestError.message) })
        .finally(() => { if (active) setProductsLoading(false) })
    }, productSearch ? 300 : 0)
    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [activeSection, productPage, productSearch, productStatus, refreshKey])

  useEffect(() => {
    if (activeSection !== 'digital-assets') return undefined
    let active = true
    Promise.resolve()
      .then(() => {
        if (!active) return null
        setDigitalSubmissionsLoading(true)
        setDigitalSubmissionsError('')
        return adminApi.digitalAssetSubmissions(`?status=${digitalSubmissionStatus}&page=${digitalSubmissionPage}&limit=20`)
      })
      .then((result) => {
        if (!active || !result) return
        setDigitalSubmissions(result.data || [])
        setDigitalSubmissionsPagination(result.pagination || { page: digitalSubmissionPage, totalPages: 0, totalItems: 0 })
        if (result.pagination && digitalSubmissionPage > result.pagination.totalPages) {
          setDigitalSubmissionPage(Math.max(result.pagination.totalPages, 1))
        }
      })
      .catch((requestError) => { if (active) setDigitalSubmissionsError(requestError.message) })
      .finally(() => { if (active) setDigitalSubmissionsLoading(false) })
    return () => { active = false }
  }, [activeSection, digitalSubmissionPage, digitalSubmissionStatus, refreshKey])

  useEffect(() => {
    if (activeSection !== 'shops') return undefined
    let active = true
    Promise.resolve()
      .then(() => {
        if (!active) return null
        setShopApplicationsLoading(true)
        setShopApplicationsError('')
        return adminApi.shops(`?status=${shopApplicationStatus}&page=${shopApplicationPage}&limit=20`)
      })
      .then((result) => {
        if (!active || !result) return
        setShopApplications(result.data || [])
        setShopApplicationsPagination(result.pagination || { page: 1, totalPages: 1, totalItems: 0 })
      })
      .catch((requestError) => { if (active) setShopApplicationsError(requestError.message) })
      .finally(() => { if (active) setShopApplicationsLoading(false) })
    return () => { active = false }
  }, [activeSection, shopApplicationPage, shopApplicationStatus, refreshKey])

  useEffect(() => {
    if (!['promotions', 'ads'].includes(activeSection)) return undefined
    let active = true
    Promise.resolve()
      .then(() => {
        if (!active) return null
        setAdSettingsLoading(true)
        setAdSettingsError('')
        const requests = activeSection === 'promotions'
          ? [
            adminApi.communityPromotionPricing(),
            adminApi.communityPromotions('pending_review', communityPromotionPage, 20),
          ]
          : [
            adminApi.adPlacements(),
            adminApi.adCampaigns(adCampaignStatus, adCampaignPage, 20),
          ]
        return Promise.all(requests)
      })
      .then((results) => {
        if (!active || !results) return
        if (activeSection === 'promotions') {
          const [pricingResult, promotionResult] = results
          setCommunityPromotionPrices((pricingResult.data || []).map((item) => ({
            ...item,
            price: Number(item.price) > 0 ? String(item.price) : '',
          })))
          setCommunityPromotions(promotionResult.data || [])
          setCommunityPromotionPagination(promotionResult.pagination || { page: communityPromotionPage, totalPages: 0, totalItems: 0 })
          if (promotionResult.pagination && communityPromotionPage > promotionResult.pagination.totalPages) {
            setCommunityPromotionPage(Math.max(promotionResult.pagination.totalPages, 1))
          }
        } else {
          const [placementResult, campaignResult] = results
          setAdPlacements((placementResult.data || []).map((placement) => ({
            ...placement,
            durationPrices: (placement.durationPrices || []).map((item) => ({
              ...item,
              price: Number(item.price) > 0 ? String(item.price) : '',
            })),
          })))
          setAdCampaigns(campaignResult.data || [])
          setAdCampaignPagination(campaignResult.pagination || { page: adCampaignPage, totalPages: 0, totalItems: 0 })
          if (campaignResult.pagination && adCampaignPage > campaignResult.pagination.totalPages) {
            setAdCampaignPage(Math.max(campaignResult.pagination.totalPages, 1))
          }
        }
      })
      .catch((requestError) => { if (active) setAdSettingsError(requestError.message) })
      .finally(() => { if (active) setAdSettingsLoading(false) })
    return () => { active = false }
  }, [activeSection, adCampaignPage, adCampaignStatus, communityPromotionPage, refreshKey])

  useEffect(() => {
    if (!productStatusOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!productStatusRef.current?.contains(event.target)) setProductStatusOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setProductStatusOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [productStatusOpen])

  const updateProduct = (event) => {
    const { name, value } = event.target
    if (name === 'name') {
      generateOnNameChange.current = true
      requestedContentRevision.current = productContentRevision.current
      setAiStatus('Generating product details after you finish entering the name…')
    }
    if (['category', 'description', 'packagingDetails', 'tags'].includes(name)) {
      productContentRevision.current += 1
    }
    setProduct((current) => ({ ...current, [name]: value }))
    setProductError('')
  }

  const updateProductImage = (index, value) => {
    setProduct((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => imageIndex === index ? value : image),
    }))
    setProductError('')
  }

  const updateProductHighlight = (index, value) => {
    productContentRevision.current += 1
    setProduct((current) => ({
      ...current,
      keyHighlights: current.keyHighlights.map((highlight, highlightIndex) => highlightIndex === index ? value : highlight),
    }))
    setProductError('')
  }

  const updateProductSpecification = (index, field, value) => {
    productContentRevision.current += 1
    setProduct((current) => ({
      ...current,
      specifications: current.specifications.map((specification, specificationIndex) => (
        specificationIndex === index ? { ...specification, [field]: value } : specification
      )),
    }))
    setProductError('')
  }

  const updateProductColor = (index, value) => {
    setProduct((current) => ({
      ...current,
      colors: current.colors.map((color, colorIndex) => colorIndex === index ? value : color),
    }))
    setProductError('')
  }

  useEffect(() => {
    if (!modalOpen || product.productType !== 'product' || !generateOnNameChange.current) return undefined
    const productName = product.name.trim()
    if (!productName) {
      generateOnNameChange.current = false
      return undefined
    }
    let active = true
    const timeout = window.setTimeout(async () => {
      generateOnNameChange.current = false
      const revisionAtStart = requestedContentRevision.current
      setGeneratingProductDetails(true)
      setAiStatus('Generating product details with Gemini…')
      try {
        const result = await adminApi.generateStoreProductDetails(productName)
        const details = result.data
        if (
          typeof details.category !== 'string' ||
          typeof details.description !== 'string' ||
          !Array.isArray(details.keyHighlights) ||
          !Array.isArray(details.specifications) ||
          typeof details.packagingDetails !== 'string' ||
          !Array.isArray(details.tags)
        ) {
          throw new Error('Gemini returned product details in an unexpected format. Try again.')
        }
        if (!active) return
        if (productContentRevision.current !== revisionAtStart) {
          setAiStatus('Generation finished, but your edited details were kept unchanged.')
          return
        }
        setProduct((current) => ({
          ...current,
          category: details.category.slice(0, 80),
          description: details.description.slice(0, 5000),
          keyHighlights: details.keyHighlights.filter((value) => typeof value === 'string').slice(0, 30).map((value) => value.slice(0, 300)),
          specifications: details.specifications
            .filter((value) => value && typeof value.label === 'string' && typeof value.value === 'string')
            .slice(0, 50)
            .map(({ label, value }) => ({ label: label.slice(0, 80), value: value.slice(0, 500) })),
          packagingDetails: details.packagingDetails.slice(0, 5000),
          tags: details.tags.filter((value) => typeof value === 'string').slice(0, 30).join(', '),
        }))
        setAiStatus('Product details generated. Review them before saving.')
      } catch (generationError) {
        if (!active) return
        setAiStatus(generationError.message || 'Could not generate product details.')
      } finally {
        if (active) setGeneratingProductDetails(false)
      }
    }, 900)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [modalOpen, product.name, product.productType])

  const uploadProductImage = async (index, file) => {
    setUploadingImageIndex(index)
    setProductError('')
    setNotice('')
    try {
      const result = await adminApi.uploadStoreProductImage(file)
      const imageUrl = result.data?.url
      if (!imageUrl) throw new Error('The image upload did not return a saved URL.')
      updateProductImage(index, imageUrl)
      setNotice('Image uploaded. Save the product to publish it.')
    } catch (uploadError) {
      setProductError(uploadError.message || 'Could not upload the product image.')
    } finally {
      setUploadingImageIndex(null)
    }
  }

  const uploadProductSourceCode = async (file, fieldName) => {
    const setUploading = fieldName === 'templateSourceCodeUrl' ? setUploadingTemplateSourceCode : setUploadingSourceCode
    setUploading(true)
    setProductError('')
    setNotice('')
    try {
      const result = await adminApi.uploadStoreProductSourceCode(file)
      const sourceCodeUrl = result.data?.sourceCodeUrl
      if (!sourceCodeUrl) throw new Error('The source-code upload did not return a saved URL.')
      const backupFieldName = fieldName === 'templateSourceCodeUrl'
        ? 'templateSourceCodeCloudinaryUrl'
        : 'sourceCodeCloudinaryUrl'
      setProduct((current) => ({
        ...current,
        [fieldName]: sourceCodeUrl,
        [backupFieldName]: result.data?.sourceCodeCloudinaryUrl || '',
      }))
      setNotice(`${fieldName === 'templateSourceCodeUrl' ? 'Full-template' : 'Rental'} source-code ZIP uploaded. Save the product to publish it.`)
    } catch (uploadError) {
      setProductError(uploadError.message || 'Could not upload the source-code ZIP.')
    } finally {
      setUploading(false)
    }
  }

  const uploadProductDocuments = async (files, fieldName = 'documents') => {
    const selectedFiles = Array.from(files)
    if (!selectedFiles.length) return
    if (product[fieldName].length + selectedFiles.length > 10) {
      setProductError('Upload no more than 10 documents for a product.')
      return
    }
    const invalidFile = selectedFiles.find((file) => file.size > 20 * 1024 * 1024)
    if (invalidFile) {
      setProductError('Choose files up to 20 MB each.')
      return
    }
    setUploadingDocuments(true)
    setProductError('')
    setNotice('')
    const uploads = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      fieldName,
      name: file.name,
      status: 'uploading',
      error: '',
    }))
    setDocumentUploadFeedback(uploads)
    const uploadErrors = []
    try {
      for (const [index, file] of selectedFiles.entries()) {
        const upload = uploads[index]
        try {
          const result = await adminApi.uploadStoreProductDocument(file)
          const document = result.data?.document
          if (!document?.url || !document.name || !document.mimeType) {
            throw new Error('The document upload did not return a saved file.')
          }
          setProduct((current) => ({ ...current, [fieldName]: [...current[fieldName], document] }))
          setDocumentUploadFeedback((current) => current.filter((entry) => entry.id !== upload.id))
        } catch (uploadError) {
          const message = uploadError.message || `Could not upload ${file.name}.`
          uploadErrors.push(message)
          setDocumentUploadFeedback((current) => current.map((entry) => (
            entry.id === upload.id ? { ...entry, status: 'failed', error: message } : entry
          )))
        }
      }
      if (uploadErrors.length) setProductError(uploadErrors.join(' '))
      else setNotice('Documents uploaded. Save the product to make them available to buyers.')
    } finally {
      setUploadingDocuments(false)
    }
  }

  const productRequestBody = () => ({
    ...product,
    price: product.productType === 'product' ? Number(product.price) : 0,
    image: product.images[0]?.trim() || '',
    images: product.images.map((image) => image.trim()).filter(Boolean),
    keyHighlights: product.keyHighlights.map((highlight) => highlight.trim()).filter(Boolean),
    specifications: product.specifications
      .map(({ label, value }) => ({ label: label.trim(), value: value.trim() }))
      .filter(({ label, value }) => label && value),
    colors: product.colors.map((color) => color.trim()).filter(Boolean),
    discountPercent: product.productType === 'product' && product.discountPercent ? Number(product.discountPercent) : 0,
    usePrice: Number(product.usePrice || 0),
    templatePrice: Number(product.templatePrice || 0),
    stock: Number(product.stock),
    tags: product.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
  })

  const submitProduct = async (event) => {
    event.preventDefault()
    setSavingProduct(true)
    setProductError('')
    setNotice('')
    try {
      if (editingProductId) {
        await adminApi.updateStoreProduct(editingProductId, productRequestBody())
      } else {
        await adminApi.createStoreProduct(productRequestBody())
      }
      setModalOpen(false)
      setProduct(emptyProduct)
      generateOnNameChange.current = false
      setEditingProductId(null)
      setPagination((current) => ({ ...current, page: 1 }))
      setProductPage(1)
      setNotice(editingProductId ? 'Product updated.' : 'Product added to the store catalog.')
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setProductError(requestError.message)
    } finally {
      setSavingProduct(false)
    }
  }

  const openProductModal = (selectedProduct = null) => {
    setProductError('')
    setProductTypeOpen(false)
    setAddingProductCategory(false)
    setEditingProductId(selectedProduct?._id || null)
    setProduct(selectedProduct ? {
      name: selectedProduct.name || '',
      productType: selectedProduct.productType || 'product',
      category: selectedProduct.category || '',
      description: selectedProduct.description || '',
      expectedDelivery: selectedProduct.expectedDelivery || '',
      keyHighlights: Array.isArray(selectedProduct.keyHighlights) && selectedProduct.keyHighlights.length
        ? selectedProduct.keyHighlights
        : [''],
      specifications: Array.isArray(selectedProduct.specifications) && selectedProduct.specifications.length
        ? selectedProduct.specifications.map(({ label, value }) => ({ label: label || '', value: value || '' }))
        : [{ label: '', value: '' }],
      colors: Array.isArray(selectedProduct.colors)
        ? selectedProduct.colors.map(normalizeProductColor)
        : [],
      packagingDetails: selectedProduct.packagingDetails || '',
      price: String(selectedProduct.price ?? ''),
      websiteUrl: selectedProduct.websiteUrl || '',
      apkUrl: selectedProduct.apkUrl || '',
      iosAppUrl: selectedProduct.iosAppUrl || '',
      usageInstructions: selectedProduct.usageInstructions || '',
      usePrice: String(selectedProduct.usePrice || ''),
      templatePrice: String(selectedProduct.templatePrice || ''),
      discountPercent: String(Number(selectedProduct.discountPercent) > 0
        ? selectedProduct.discountPercent
        : Number(selectedProduct.compareAtPrice) > Number(selectedProduct.price)
          ? (100 - (Number(selectedProduct.price) / Number(selectedProduct.compareAtPrice)) * 100).toFixed(2)
          : ''),
      condition: selectedProduct.condition === 'used' ? 'used' : 'brand_new',
      isSold: selectedProduct.isSold === true,
      image: productImages(selectedProduct)[0] || '',
      images: productImages(selectedProduct).length ? productImages(selectedProduct) : [''],
      stock: String(selectedProduct.stock ?? 0),
      tags: Array.isArray(selectedProduct.tags) ? selectedProduct.tags.join(', ') : '',
      sourceCodeUrl: selectedProduct.sourceCodeUrl || '',
      sourceCodeCloudinaryUrl: selectedProduct.sourceCodeCloudinaryUrl || '',
      templateSourceCodeUrl: selectedProduct.templateSourceCodeUrl
        || (Number(selectedProduct.sourceArchiveVersion) < 2 ? selectedProduct.sourceCodeUrl || '' : ''),
      templateSourceCodeCloudinaryUrl: selectedProduct.templateSourceCodeCloudinaryUrl || '',
      documents: Array.isArray(selectedProduct.documents) ? selectedProduct.documents : [],
      templateDocuments: Array.isArray(selectedProduct.templateDocuments) ? selectedProduct.templateDocuments : [],
      isActive: selectedProduct.isActive !== false,
    } : emptyProduct)
    generateOnNameChange.current = false
    productContentRevision.current = 0
    setAiStatus('')
    setModalOpen(true)
  }

  const deleteProduct = async () => {
    if (!productToDelete) return
    const selectedProduct = productToDelete
    setDeletingProductId(selectedProduct._id)
    setProductsError('')
    setNotice('')
    try {
      await adminApi.deleteStoreProduct(selectedProduct._id)
      setNotice(`${selectedProduct.name} was deleted.`)
      setProductToDelete(null)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setProductsError(requestError.message)
    } finally {
      setDeletingProductId(null)
    }
  }

  const uploadDigitalSourceCode = async (asset, file) => {
    setUploadingDigitalSourceId(asset._id)
    setDigitalSubmissionsError('')
    try {
      const result = await adminApi.uploadSellerDigitalAssetSourceCode(asset._id, file)
      setDigitalSubmissions((current) => current.map((item) => item._id === asset._id
        ? { ...item, sourceCodeUrl: result.data?.sourceCodeUrl }
        : item))
      setNotice(`Source-code ZIP uploaded for ${asset.name}.`)
    } catch (requestError) {
      setDigitalSubmissionsError(requestError.message)
    } finally {
      setUploadingDigitalSourceId('')
    }
  }

  const reviewSellerDigitalAsset = async (asset, decision) => {
    const reviewNote = decision === 'rejected'
      ? window.prompt(`Reason for requesting changes to ${asset.name}:`, asset.sellerReviewNote || '')
      : ''
    if (decision === 'rejected' && reviewNote === null) return
    setReviewingDigitalAssetId(asset._id)
    setDigitalSubmissionsError('')
    try {
      await adminApi.reviewDigitalAsset(asset._id, { decision, reviewNote })
      setDigitalSubmissions((current) => current.filter((item) => item._id !== asset._id))
      setNotice(`${asset.name} ${decision === 'approved' ? 'approved and published' : 'returned to the seller'}.`)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setDigitalSubmissionsError(requestError.message)
    } finally {
      setReviewingDigitalAssetId('')
    }
  }

  const reviewShopApplication = async (shop, status, reviewNote = '') => {
    if (status === 'rejected' && reviewNote.trim().length < 5) {
      setShopApplicationsError('Enter a clear review reason of at least 5 characters.')
      return false
    }

    setReviewingShopId(shop._id)
    setShopApplicationsError('')
    setNotice('')
    try {
      await adminApi.reviewShop(shop._id, { status, reviewNote })
      setNotice(`${shop.businessName} was ${status === 'approved' ? 'approved' : 'returned with requested changes'}.`)
      setShopApplicationsLoading(true)
      setRefreshKey((current) => current + 1)
      return true
    } catch (requestError) {
      setShopApplicationsError(requestError.message)
      return false
    } finally {
      setReviewingShopId('')
    }
  }

  const requestShopChanges = async (event) => {
    event.preventDefault()
    if (!shopReviewTarget) return
    const submitted = await reviewShopApplication(shopReviewTarget, 'rejected', shopReviewNote)
    if (submitted) setShopReviewTarget(null)
  }

  const saveAdPlacement = async (placement) => {
    setSavingPlacementKey(placement.key)
    setAdSettingsError('')
    try {
      const result = await adminApi.updateAdPlacement(placement.key, {
        name: placement.name,
        description: placement.description,
        active: placement.active,
        durationPrices: placement.durationPrices.map((item) => ({ ...item, price: Number(item.price) || 0 })),
      })
      setAdPlacements((current) => current.map((item) => item.key === placement.key ? {
        ...result.data,
        durationPrices: (result.data.durationPrices || []).map((duration) => ({
          ...duration,
          price: Number(duration.price) > 0 ? String(duration.price) : '',
        })),
      } : item))
      setNotice(`${placement.name} settings saved.`)
    } catch (requestError) {
      setAdSettingsError(requestError.message)
    } finally {
      setSavingPlacementKey('')
    }
  }

  const reviewAdvertisement = async (campaign, status) => {
    const reviewNote = status === 'rejected'
      ? window.prompt('Add a short reason for requesting changes:')
      : ''
    if (status === 'rejected' && reviewNote === null) return
    setReviewingCampaignId(campaign._id)
    setAdSettingsError('')
    try {
      await adminApi.reviewAdCampaign(campaign._id, { status, reviewNote })
      setAdCampaigns((current) => current.filter((item) => item._id !== campaign._id))
      setNotice(`Advertisement "${campaign.title}" ${status}.`)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setAdSettingsError(requestError.message)
    } finally {
      setReviewingCampaignId('')
    }
  }

  const saveCommunityPromotionPrices = async () => {
    setSavingCommunityPrices(true)
    setAdSettingsError('')
    try {
      const result = await adminApi.updateCommunityPromotionPricing({
        durations: communityPromotionPrices.map((item) => ({ ...item, price: Number(item.price) || 0 })),
      })
      setCommunityPromotionPrices((result.data || []).map((item) => ({
        ...item,
        price: Number(item.price) > 0 ? String(item.price) : '',
      })))
      setNotice('Community promotion prices saved.')
    } catch (requestError) {
      setAdSettingsError(requestError.message)
    } finally {
      setSavingCommunityPrices(false)
    }
  }

  const reviewCommunityPromotion = async (promotion, status) => {
    const reviewNote = status === 'rejected'
      ? window.prompt('Add a short reason for rejecting this promotion:')
      : ''
    if (status === 'rejected' && reviewNote === null) return
    setReviewingPromotionId(promotion._id)
    setAdSettingsError('')
    try {
      await adminApi.reviewCommunityPromotion(promotion._id, { status, reviewNote })
      setCommunityPromotions((current) => current.filter((item) => item._id !== promotion._id))
      setNotice(`Promotion for "${promotion.listing?.title || 'community listing'}" ${status}.`)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setAdSettingsError(requestError.message)
    } finally {
      setReviewingPromotionId('')
    }
  }

  const sectionTitles = {
    orders: ['Orders & fulfillment', 'Review paid orders and keep deliveries moving.'],
    products: ['Store products', 'Manage physical products and digital listings in the Cardzip catalog.'],
    'digital-assets': ['Digital submissions', 'Review seller-submitted websites and apps before publishing.'],
    shops: ['Shop verification', 'Review business details and verify shop applications.'],
    promotions: ['Marketplace promotions', 'Set listing promotion prices and review paid placements.'],
    ads: ['Banner advertisements', 'Set website and app banner prices and review campaigns.'],
  }
  const [pageTitle, pageSubtitle] = sectionTitles[activeSection] || sectionTitles.orders
  const sectionCount = activeSection === 'orders'
    ? `${pagination.totalItems.toLocaleString()} orders`
    : activeSection === 'products'
      ? `${productPagination.totalItems.toLocaleString()} products`
      : activeSection === 'digital-assets'
        ? `${digitalSubmissionsPagination.totalItems.toLocaleString()} submissions`
        : activeSection === 'shops'
          ? `${shopApplicationsPagination.totalItems.toLocaleString()} applications`
          : activeSection === 'promotions'
            ? `${communityPromotions.length.toLocaleString()} promotions to review`
            : `${adCampaigns.length.toLocaleString()} campaigns to review`

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-subtitle">{pageSubtitle}</p>
        </div>
        <div className="header-actions">
          {activeSection === 'products' && <button type="button" className="btn-primary" onClick={() => openProductModal()}><Plus size={15} /> Add Product</button>}
        </div>
      </div>

      {notice && <p className="wallet-notice success" role="status">{notice}</p>}
      {activeSection === 'orders' && <div className="ecom-metrics-grid">
        <div className="stat-card">
          <span className="stat-label">Total Store Volume</span>
          <span className="stat-value">{formatNaira(stats.totalStoreVolume)}</span>
          <span className="stat-sub">All paid orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Orders Pending Dispatch</span>
          <span className="stat-value text-amber">{stats.pendingDispatch.toLocaleString()}</span>
          <span className="stat-sub">Paid orders in processing</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Listed SKUs</span>
          <span className="stat-value">{stats.activeProducts.toLocaleString()}</span>
          <span className="stat-sub">{stats.lowStockProducts.toLocaleString()} with 5 or fewer in stock</span>
        </div>
      </div>}

      <div className="section-card">
        <div className="card-header ecom-orders-header">
          <div className="ecom-section-heading">
            <strong>{activeSection === 'orders' ? 'Recent orders' : pageTitle}</strong>
            <span className="text-muted">{sectionCount}</span>
          </div>
          {activeSection === 'orders' ? (
            <label className="search-box-sm ecom-order-search">
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search order, customer or product..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPagination((current) => ({ ...current, page: 1 }))
                }}
              />
            </label>
          ) : activeSection === 'products' ? (
            <div className="ecom-product-toolbar">
              <label className="search-box-sm ecom-order-search">
                <Search size={14} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search product name, category or tag..."
                  value={productSearch}
                  onChange={(event) => {
                    setProductSearch(event.target.value)
                    setProductPage(1)
                  }}
                />
              </label>
              <div className="ecom-product-filter" ref={productStatusRef}>
                <button
                  type="button"
                  className="ecom-product-filter-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={productStatusOpen}
                  onClick={() => setProductStatusOpen((current) => !current)}
                >
                  {productStatus === 'all' ? 'All products' : productStatus === 'active' ? 'Active' : 'Inactive'}
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                {productStatusOpen && (
                  <div className="ecom-product-filter-menu" role="listbox" aria-label="Filter products by visibility">
                    {[
                      { value: 'all', label: 'All products' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={productStatus === option.value}
                        className={`ecom-product-filter-option ${productStatus === option.value ? 'selected' : ''}`}
                        onClick={() => {
                          setProductStatus(option.value)
                          setProductPage(1)
                          setProductStatusOpen(false)
                        }}
                      >
                        {option.label}
                        {productStatus === option.value && <Check size={14} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeSection === 'digital-assets' ? (
            <label className="form-group ecom-shop-status-filter">Submission status
              <CustomSelect
                className="ecom-shop-status-select"
                ariaLabel="Submission status"
                value={digitalSubmissionStatus}
                options={[
                  { value: 'pending_review', label: 'Pending review' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Changes requested' },
                ]}
                onChange={(value) => {
                  setDigitalSubmissionsLoading(true)
                  setDigitalSubmissionsError('')
                  setDigitalSubmissionPage(1)
                  setDigitalSubmissionStatus(value)
                }}
              />
            </label>
          ) : activeSection === 'shops' ? (
            <label className="form-group ecom-shop-status-filter">Application status
              <CustomSelect
                className="ecom-shop-status-select"
                ariaLabel="Application status"
                value={shopApplicationStatus}
                options={[
                  { value: 'pending', label: 'Pending review' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Changes requested' },
                ]}
                onChange={(value) => { setShopApplicationsLoading(true); setShopApplicationsError(''); setShopApplicationPage(1); setShopApplicationStatus(value) }}
              />
            </label>
          ) : activeSection === 'ads' ? (
            <label className="form-group ecom-shop-status-filter">Campaigns
              <CustomSelect
                className="ecom-shop-status-select"
                ariaLabel="Campaign status"
                value={adCampaignStatus}
                options={[
                  { value: 'pending_review', label: 'Pending review' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
                onChange={(value) => {
                  setAdCampaignPage(1)
                  setAdCampaignStatus(value)
                }}
              />
            </label>
          ) : null}
        </div>

        {activeSection === 'orders' ? (
          <>
            {error && <p className="wallet-notice error" role="alert">{error}</p>}
            {loading && <p className="ecom-orders-loading" role="status">Loading orders…</p>}
            <div className="table-responsive">
              <table className="ecom-table">
                <thead>
                  <tr><th>Order Ref</th><th>Customer</th><th>Item(s)</th><th>Total Value</th><th>Courier Partner</th><th>Fulfillment Status</th><th className="text-right">Action</th></tr>
                </thead>
                <tbody>
                  {!loading && orders.map((order) => (
                    <tr key={order._id}>
                      <td className="font-mono">{order.orderNumber}</td>
                      <td className="font-bold">{order.user?.name || order.shippingAddress?.name || order.user?.email || 'Unknown customer'}</td>
                      <td>{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ') || '—'}</td>
                      <td className="font-bold">{formatNaira(order.total)}</td>
                      <td className="text-muted">{order.courierService || 'Not assigned'}{order.trackingNumber ? <small className="order-tracking-cell">{order.trackingNumber}</small> : null}</td>
                      <td><span className={`status-badge ${String(order.status || 'processing').replaceAll('_', '-')}`}>{formatStatus(order.status)}</span></td>
                      <td className="text-right"><button type="button" className="btn-table-action" onClick={() => onViewOrder?.(order)}>View Details</button></td>
                    </tr>
                  ))}
                  {!loading && orders.length === 0 && (
                    <tr><td colSpan="7" className="ecom-orders-empty"><ShoppingBag size={18} />{search ? 'No orders match your search.' : 'No store orders have been placed yet.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="trade-history-footer">
              <span>Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} orders</span>
              <div className="pagination-controls">
                <button className="btn-page" type="button" disabled={loading || pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
                <button className="btn-page" type="button" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
              </div>
            </div>
          </>
        ) : activeSection === 'products' ? (
          <>
            {productsError && <p className="wallet-notice error" role="alert">{productsError}</p>}
            {productsLoading && <p className="ecom-orders-loading" role="status">Loading products…</p>}
            <div className="table-responsive">
              <table className="ecom-table ecom-products-table">
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Condition</th><th>Sale status</th><th>Stock</th><th>Visibility</th><th className="text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {!productsLoading && products.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="ecom-product-cell">
                          {productImages(item)[0] ? <img src={productImages(item)[0]} alt="" loading="lazy" /> : <span className="ecom-product-placeholder"><Package size={17} /></span>}
                          <span className="ecom-product-copy">
                            <strong>{truncateProductText(item.name, 36)}</strong>
                            {item.productType && item.productType !== 'product' && <small>{item.productType === 'app' ? 'Android app' : item.productType === 'ios_app' ? 'iOS app' : item.productType === 'full_stack' ? 'Full stack' : item.productType === 'admin' ? 'Admin' : 'Web'}</small>}
                            <small>{item.slug}</small>
                            <span className="ecom-product-description">
                              {truncateProductText(item.description || 'No description added.', 50)}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td>{item.category || 'General'}</td>
                      <td className="font-bold">
                        {item.productType && item.productType !== 'product' ? (
                          <span style={{ display: 'grid', gap: 4, fontWeight: 600 }}>
                            {Number(item.usePrice) > 0 && <small>Use: {formatNaira(item.usePrice)}</small>}
                            {Number(item.templatePrice) > 0 && <small>Template: {formatNaira(item.templatePrice)}</small>}
                          </span>
                        ) : Number(item.compareAtPrice) > Number(item.price) && (
                          <span className="ecom-original-price">{formatNaira(item.compareAtPrice)}</span>
                        )}
                        {(!item.productType || item.productType === 'product') && <span>{formatNaira(item.price)}</span>}
                      </td>
                      <td>{item.productType && item.productType !== 'product' ? 'Digital' : item.condition === 'used' ? 'Used' : 'Brand new'}</td>
                      <td><span className={`ecom-product-visibility ${item.isSold ? 'inactive' : 'active'}`}>{item.isSold ? 'Sold' : 'Available'}</span></td>
                      <td>{Number(item.stock || 0).toLocaleString()}</td>
                      <td><span className={`ecom-product-visibility ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="text-right">
                        <div className="ecom-product-actions">
                          <button type="button" className="btn-table-action" onClick={() => openProductModal(item)}><Pencil size={14} /> Edit</button>
                          <button type="button" className="ecom-delete-product" disabled={deletingProductId === item._id} onClick={() => setProductToDelete(item)}><Trash2 size={14} />Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!productsLoading && products.length === 0 && (
                    <tr><td colSpan="8" className="ecom-orders-empty"><Package size={18} />{productSearch ? 'No products match your search.' : 'No products found in the catalog.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="trade-history-footer">
              <span>Page {productPagination.page} of {productPagination.totalPages} · {productPagination.totalItems} products</span>
              <div className="pagination-controls">
                <button className="btn-page" type="button" disabled={productsLoading || productPage <= 1} onClick={() => setProductPage((current) => Math.max(1, current - 1))}>Previous</button>
                <button className="btn-page" type="button" disabled={productsLoading || productPage >= productPagination.totalPages} onClick={() => setProductPage((current) => current + 1)}>Next</button>
              </div>
            </div>
          </>
        ) : activeSection === 'digital-assets' ? (
          <>
            {digitalSubmissionsError && <p className="wallet-notice error" role="alert">{digitalSubmissionsError}</p>}
            {digitalSubmissionsLoading && <p className="ecom-orders-loading" role="status">Loading digital submissions…</p>}
            <div className="table-responsive">
              <table className="ecom-table ecom-digital-submissions-table">
                <thead><tr><th>Listing</th><th>Seller</th><th>Type &amp; price</th><th>Preview URL</th><th>Source archive</th><th className="text-right">Review</th></tr></thead>
                <tbody>
                  {!digitalSubmissionsLoading && digitalSubmissions.map((asset) => {
                    const sourceUrl = asset.productType === 'website' ? asset.websiteUrl : asset.productType === 'app' ? asset.apkUrl : asset.iosAppUrl
                    return <tr key={asset._id}>
                      <td><div className="ecom-product-cell">{asset.image ? <img src={asset.image} alt="" loading="lazy" /> : <span className="ecom-product-placeholder"><Package size={17} /></span>}<span className="ecom-product-copy"><strong>{truncateProductText(asset.name, 40)}</strong><small>{asset.category || 'Digital'}</small><span className="ecom-product-description">{truncateProductText(asset.description, 80)}</span><small>{asset.screenshots?.length || 0} screenshots uploaded</small></span></div></td>
                      <td>{asset.owner?.name || 'Unknown'}<small className="ecom-shop-description">{asset.owner?.email || ''}</small><small className="ecom-shop-description">Contact: {asset.sellerContact}</small></td>
                      <td>{asset.productType === 'ios_app' ? 'iOS app' : asset.productType === 'app' ? 'Android app' : 'Website'}<small className="ecom-shop-description">{formatNaira(asset.price)}</small></td>
                      <td>{sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer">Open submitted URL</a> : 'Missing'}</td>
                      <td><div className="ecom-digital-source-cell"><span>{asset.sourceCodeUrl ? 'ZIP uploaded' : 'Required before approval'}</span><label className="ecom-source-upload">{uploadingDigitalSourceId === asset._id ? 'Uploading…' : 'Upload / replace ZIP'}<input type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={uploadingDigitalSourceId === asset._id} onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (!file) return; if (!file.name.toLowerCase().endsWith('.zip') || file.size > 100 * 1024 * 1024) { setDigitalSubmissionsError('Choose a ZIP source-code archive up to 100 MB.'); return } void uploadDigitalSourceCode(asset, file) }} /></label></div></td>
                      <td className="text-right"><div className="ecom-product-actions">
                        <button type="button" className="btn-table-action" disabled={reviewingDigitalAssetId === asset._id || !asset.sourceCodeUrl} onClick={() => void reviewSellerDigitalAsset(asset, 'approved')}><Check size={14} /> Approve &amp; publish</button>
                        {asset.sellerListingStatus !== 'rejected' && <button type="button" className="ecom-delete-product" disabled={reviewingDigitalAssetId === asset._id} onClick={() => void reviewSellerDigitalAsset(asset, 'rejected')}>Request changes</button>}
                      </div></td>
                    </tr>
                  })}
                  {!digitalSubmissionsLoading && digitalSubmissions.length === 0 && <tr><td colSpan="6" className="ecom-orders-empty"><ShoppingBag size={18} />No {digitalSubmissionStatus.replace('_', ' ')} digital listings.</td></tr>}
                </tbody>
              </table>
            </div>
            {digitalSubmissionsPagination.totalPages > 1 && (
              <div className="trade-history-footer">
                <span>Page {digitalSubmissionsPagination.page} of {digitalSubmissionsPagination.totalPages} · {digitalSubmissionsPagination.totalItems} submissions</span>
                <div className="pagination-controls">
                  <button className="btn-page" type="button" disabled={digitalSubmissionsLoading || digitalSubmissionPage <= 1} onClick={() => setDigitalSubmissionPage((page) => Math.max(1, page - 1))}>Previous</button>
                  <button className="btn-page" type="button" disabled={digitalSubmissionsLoading || digitalSubmissionPage >= digitalSubmissionsPagination.totalPages} onClick={() => setDigitalSubmissionPage((page) => page + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        ) : activeSection === 'shops' ? (
          <>
            {shopApplicationsError && <p className="wallet-notice error" role="alert">{shopApplicationsError}</p>}
            {shopApplicationsLoading && <p className="ecom-orders-loading" role="status">Loading shop applications…</p>}
            <div className="table-responsive">
              <table className="ecom-table ecom-shops-table">
                <thead><tr><th>Business</th><th>Owner</th><th>Full public address</th><th>Contact</th><th>Submitted</th><th className="text-right">Review</th></tr></thead>
                <tbody>
                  {!shopApplicationsLoading && shopApplications.map((shop) => (
                    <tr key={shop._id}>
                      <td><strong>{shop.businessName}</strong><small className="ecom-shop-description">{shop.description || 'No business description supplied.'}</small></td>
                      <td>{shop.owner?.name || 'Unknown'}<small className="ecom-shop-description">{shop.owner?.email || 'No email available'}</small></td>
                      <td><span className="ecom-shop-address"><MapPin size={13} />{shop.address}</span></td>
                      <td>{shop.contactPhone}</td>
                      <td>{new Date(shop.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">{shop.status === 'pending' ? <div className="ecom-product-actions">
                        <button type="button" className="btn-table-action" disabled={reviewingShopId === shop._id} onClick={() => void reviewShopApplication(shop, 'approved')}><Check size={14} /> Verify &amp; approve</button>
                        <button type="button" className="ecom-delete-product" disabled={reviewingShopId === shop._id} onClick={() => {
                          setShopReviewTarget(shop)
                          setShopReviewNote(shop.reviewNote || '')
                          setShopApplicationsError('')
                        }}>Request changes</button>
                      </div> : <span className={`ecom-product-visibility ${shop.status === 'approved' ? 'active' : 'inactive'}`}>{shop.status === 'approved' ? 'Approved' : 'Changes requested'}</span>}</td>
                    </tr>
                  ))}
                  {!shopApplicationsLoading && shopApplications.length === 0 && <tr><td colSpan="6" className="ecom-orders-empty"><ShoppingBag size={18} />No {shopApplicationStatus} shop applications.</td></tr>}
                </tbody>
              </table>
            </div>
            {shopApplicationsPagination.totalPages > 1 && (
              <div className="trade-history-footer">
                <span>Page {shopApplicationsPagination.page} of {shopApplicationsPagination.totalPages} · {shopApplicationsPagination.totalItems} applications</span>
                <div className="pagination-controls">
                  <button className="btn-page" type="button" disabled={shopApplicationsLoading || shopApplicationPage <= 1} onClick={() => { setShopApplicationsLoading(true); setShopApplicationPage((current) => Math.max(1, current - 1)) }}>Previous</button>
                  <button className="btn-page" type="button" disabled={shopApplicationsLoading || shopApplicationPage >= shopApplicationsPagination.totalPages} onClick={() => { setShopApplicationsLoading(true); setShopApplicationPage((current) => current + 1) }}>Next</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'grid', gap: 22, padding: 20 }}>
            {adSettingsError && <p className="wallet-notice error" role="alert">{adSettingsError}</p>}
            {adSettingsLoading && <p className="ecom-orders-loading" role="status">{activeSection === 'promotions' ? 'Loading marketplace promotions…' : 'Loading banner placements and campaigns…'}</p>}
            {activeSection === 'promotions' && <>
            <section>
              <div className="ecom-section-heading" style={{ marginBottom: 12 }}>
                <div><strong>Community and digital listing promotion prices</strong><small className="ecom-shop-description">Set shared fixed 1-day, 1-week, and 1-month prices. Paid promotions remain hidden until an administrator approves them.</small></div>
              </div>
              <div className="ecom-ad-placement-card">
                <div className="ecom-ad-price-fields">
                  {communityPromotionPrices.map((duration) => (
                    <label className="ecom-ad-price-field" key={duration.key}>
                      <span>{duration.label} <small>NGN</small></span>
                      <input
                        aria-label={`${duration.label} listing promotion price in naira`}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={duration.price}
                        onChange={(event) => setCommunityPromotionPrices((current) => current.map((item) => (
                          item.key === duration.key ? { ...item, price: event.target.value } : item
                        )))}
                      />
                    </label>
                  ))}
                </div>
                <button type="button" className="btn-primary" disabled={savingCommunityPrices} onClick={() => void saveCommunityPromotionPrices()}>
                  {savingCommunityPrices ? 'Saving…' : 'Save promotion prices'}
                </button>
              </div>
            </section>
            <section>
              <div className="ecom-section-heading" style={{ marginBottom: 12 }}>
                <div><strong>Marketplace promotions awaiting approval</strong><small className="ecom-shop-description">Community items and seller websites/apps are prioritized only after approval. The chosen duration starts when approved.</small></div>
                <span className="text-muted">{communityPromotionPagination.totalItems} awaiting review</span>
              </div>
              <div className="table-responsive">
                <table className="ecom-table">
                  <thead><tr><th>Listing</th><th>Seller</th><th>Promotion</th><th>Payment</th><th className="text-right">Review</th></tr></thead>
                  <tbody>
                    {!adSettingsLoading && communityPromotions.map((promotion) => {
                      const listing = promotion.digitalAsset || promotion.listing
                      const isDigitalAsset = Boolean(promotion.digitalAsset)
                      const isUnavailable = !listing || listing.isSold || (isDigitalAsset && listing.sellerListingStatus !== 'approved')
                      return (
                        <tr key={promotion._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={isDigitalAsset ? listing?.image : listing?.images?.[0] || listing?.imageUrl} alt="" loading="lazy" style={{ width: 64, height: 48, borderRadius: 7, objectFit: 'cover' }} />
                            <span><strong>{isDigitalAsset ? listing?.name || 'Listing unavailable' : listing?.title || 'Listing unavailable'}</strong><small className="ecom-shop-description">{isDigitalAsset ? `${listing?.productType || 'Digital asset'} · ` : `${listing?.category || 'Community listing'} · `}{isUnavailable ? 'Unavailable' : 'Available'}</small></span>
                          </div>
                        </td>
                        <td>{promotion.advertiser?.name || 'Unknown'}<small className="ecom-shop-description">{promotion.advertiser?.email || ''}</small></td>
                        <td>{promotion.durationDays} day{promotion.durationDays === 1 ? '' : 's'}<small className="ecom-shop-description">{formatNaira(promotion.amount)}</small></td>
                        <td>{promotion.paymentReference}<small className="ecom-shop-description">Paystack confirmed</small></td>
                        <td className="text-right"><div className="ecom-product-actions">
                          <button type="button" className="btn-table-action" disabled={reviewingPromotionId === promotion._id || isUnavailable} onClick={() => void reviewCommunityPromotion(promotion, 'approved')}><Check size={14} /> Approve</button>
                          <button type="button" className="ecom-delete-product" disabled={reviewingPromotionId === promotion._id} onClick={() => void reviewCommunityPromotion(promotion, 'rejected')}>Reject</button>
                        </div></td>
                        </tr>
                      )
                    })}
                    {!adSettingsLoading && communityPromotions.length === 0 && <tr><td colSpan="5" className="ecom-orders-empty"><ShoppingBag size={18} />No community promotions awaiting approval.</td></tr>}
                  </tbody>
                </table>
              </div>
              {communityPromotionPagination.totalPages > 1 && (
                <div className="trade-history-footer">
                  <span>Page {communityPromotionPagination.page} of {communityPromotionPagination.totalPages} · {communityPromotionPagination.totalItems} promotions</span>
                  <div className="pagination-controls">
                    <button className="btn-page" type="button" disabled={adSettingsLoading || communityPromotionPage <= 1} onClick={() => setCommunityPromotionPage((page) => Math.max(1, page - 1))}>Previous</button>
                    <button className="btn-page" type="button" disabled={adSettingsLoading || communityPromotionPage >= communityPromotionPagination.totalPages} onClick={() => setCommunityPromotionPage((page) => page + 1)}>Next</button>
                  </div>
                </div>
              )}
            </section>
            </>}
            {activeSection === 'ads' && <>
            <section>
              <div className="ecom-section-heading" style={{ marginBottom: 12 }}>
                <div><strong>Banner placement prices</strong><small className="ecom-shop-description">Set the 1-month and 12-month prices in whole naira, then enable and save each placement. Enabled placements with a price become available to advertisers.</small></div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {adPlacements.map((placement) => (
                  <article key={placement.key} className="ecom-ad-placement-card">
                    <div className="ecom-ad-placement-heading"><strong>{placement.name}</strong><small className="ecom-shop-description">{placement.platform === 'app' ? 'Mobile app' : 'Website'} · {placement.location}</small></div>
                    <div className="ecom-ad-price-fields">
                      {[1, 12].map((months) => (
                        <label className="ecom-ad-price-field" key={months}><span>{months} {months === 1 ? 'month' : 'months'} <small>NGN</small></span>
                          <input aria-label={`${placement.name}, ${months} month price in naira`} type="number" min="0" step="1" inputMode="numeric" value={placement.durationPrices?.find((item) => Number(item.months) === months)?.price ?? ''} onChange={(event) => setAdPlacements((current) => current.map((item) => item.key === placement.key ? { ...item, durationPrices: [1, 12].map((duration) => { const existingPrice = item.durationPrices?.find((entry) => Number(entry.months) === duration)?.price ?? ''; return { months: duration, price: duration === months ? event.target.value : existingPrice }; }) } : item))} />
                        </label>
                      ))}
                    </div>
                    <label className="ecom-ad-enabled"><input type="checkbox" checked={placement.active} onChange={(event) => setAdPlacements((current) => current.map((item) => item.key === placement.key ? { ...item, active: event.target.checked } : item))} />Available to advertisers</label>
                    <button type="button" className="btn-primary" disabled={savingPlacementKey === placement.key} onClick={() => void saveAdPlacement(placement)}>{savingPlacementKey === placement.key ? 'Saving…' : 'Save prices'}</button>
                  </article>
                ))}
                {!adSettingsLoading && adPlacements.length === 0 && <p className="ecom-orders-empty">No banner placements found.</p>}
              </div>
            </section>
            <section>
              <div className="ecom-section-heading" style={{ marginBottom: 12 }}>
                <div><strong>{adCampaignStatus.replaceAll('_', ' ')} advertisements</strong><small className="ecom-shop-description">Paid campaigns are not displayed until an administrator approves their creative.</small></div>
              </div>
              <div className="table-responsive">
                <table className="ecom-table">
                  <thead><tr><th>Creative</th><th>Advertiser</th><th>Placement &amp; schedule</th><th>Payment</th><th>Performance</th><th className="text-right">Review</th></tr></thead>
                  <tbody>
                    {!adSettingsLoading && adCampaigns.map((campaign) => (
                      <tr key={campaign._id}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><img src={campaign.imageUrl} alt="" loading="lazy" style={{ width: 78, height: 52, borderRadius: 7, objectFit: 'cover' }} /><span><strong>{campaign.title}</strong><small className="ecom-shop-description">{campaign.copy}</small></span></div></td>
                        <td>{campaign.advertiser?.name || 'Unknown'}<small className="ecom-shop-description">{campaign.advertiser?.email || ''}</small></td>
                        <td>{campaign.placementName}<small className="ecom-shop-description">{campaign.platform} · {campaign.months} month(s) · {new Date(campaign.startAt).toLocaleDateString()} – {new Date(campaign.endAt).toLocaleDateString()}</small></td>
                        <td>{formatNaira(campaign.amount)}<small className="ecom-shop-description">{campaign.paymentReference || 'Paystack confirmed'}</small></td>
                        <td>{(campaign.impressions || 0).toLocaleString()} impressions<small className="ecom-shop-description">{(campaign.clicks || 0).toLocaleString()} clicks · {campaign.clickThroughRate || 0}% CTR</small></td>
                        <td className="text-right">{campaign.status === 'pending_review' ? <div className="ecom-product-actions">
                          <button type="button" className="btn-table-action" disabled={reviewingCampaignId === campaign._id} onClick={() => void reviewAdvertisement(campaign, 'approved')}><Check size={14} /> Approve</button>
                          <button type="button" className="ecom-delete-product" disabled={reviewingCampaignId === campaign._id} onClick={() => void reviewAdvertisement(campaign, 'rejected')}>Request changes</button>
                        </div> : <span className={`ecom-product-visibility ${(campaign.displayStatus || campaign.status) === 'approved' ? 'active' : 'inactive'}`}>{formatStatus(campaign.displayStatus || campaign.status)}</span>}</td>
                      </tr>
                    ))}
                    {!adSettingsLoading && adCampaigns.length === 0 && <tr><td colSpan="6" className="ecom-orders-empty"><ShoppingBag size={18} />No {adCampaignStatus.replaceAll('_', ' ')} ad campaigns.</td></tr>}
                  </tbody>
                </table>
              </div>
              {adCampaignPagination.totalPages > 1 && (
                <div className="trade-history-footer">
                  <span>Page {adCampaignPagination.page} of {adCampaignPagination.totalPages} · {adCampaignPagination.totalItems} campaigns</span>
                  <div className="pagination-controls">
                    <button className="btn-page" type="button" disabled={adSettingsLoading || adCampaignPage <= 1} onClick={() => setAdCampaignPage((page) => Math.max(1, page - 1))}>Previous</button>
                    <button className="btn-page" type="button" disabled={adSettingsLoading || adCampaignPage >= adCampaignPagination.totalPages} onClick={() => setAdCampaignPage((page) => page + 1)}>Next</button>
                  </div>
                </div>
              )}
            </section>
            </>}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}>
          <section className="modal-content ecom-product-modal" role="dialog" aria-modal="true" aria-labelledby="add-product-title">
            <header className="modal-header">
            <div className="ecom-product-modal-title"><Package size={18} /><h3 id="add-product-title">{editingProductId ? 'Edit store product' : 'Add store product'}</h3></div>
            <button className="btn-close" type="button" aria-label="Close" onClick={() => { setModalOpen(false); setEditingProductId(null); setProductTypeOpen(false) }}><X size={18} /></button>
            </header>
            <form className="modal-body ecom-product-form" onSubmit={submitProduct}>
              {product.productType === 'product' && <section className="ecom-gemini-setup">
                <small>Product descriptions, highlights, specifications, packaging, category, and tags are generated from the product name using the Gemini key configured on the backend. Prices, stock, and images stay manual.</small>
                {aiStatus && <span className={`ecom-gemini-status${generatingProductDetails ? ' is-generating' : ''}`} role="status"><Sparkles size={14} />{aiStatus}</span>}
              </section>}
              <label className="form-group">Product name<input name="name" value={product.name} onChange={updateProduct} required maxLength={160} /></label>
              <div className="form-group ecom-listing-type-field">
                <span>Listing type</span>
                <div className="ecom-listing-type-select" onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setProductTypeOpen(false)
                }}>
                  <button
                    type="button"
                    className={`ecom-listing-type-trigger${productTypeOpen ? ' is-open' : ''}`}
                    aria-haspopup="listbox"
                    aria-expanded={productTypeOpen}
                    aria-controls="ecom-listing-type-options"
                    onClick={() => setProductTypeOpen((open) => !open)}
                  >
                    <span><strong>{productTypeOptions.find((option) => option.value === product.productType)?.label || 'Physical product'}</strong><small>{productTypeOptions.find((option) => option.value === product.productType)?.description}</small></span>
                    <ChevronDown size={17} aria-hidden="true" />
                  </button>
                  {productTypeOpen && <div className="ecom-listing-type-options" id="ecom-listing-type-options" role="listbox" aria-label="Listing type">
                    {productTypeOptions.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        role="option"
                        aria-selected={product.productType === option.value}
                        className={`ecom-listing-type-option${product.productType === option.value ? ' selected' : ''}`}
                        onClick={() => {
                          setProduct((current) => option.value === 'product'
                            ? { ...current, productType: option.value }
                            : {
                              ...current,
                              productType: option.value,
                              expectedDelivery: '',
                              keyHighlights: [''],
                              specifications: [{ label: '', value: '' }],
                              colors: [],
                              packagingDetails: '',
                              price: '',
                              discountPercent: '',
                              condition: 'brand_new',
                              isSold: false,
                              stock: '0',
                            })
                          setProductTypeOpen(false)
                        }}
                      >
                        <span><strong>{option.label}</strong><small>{option.description}</small></span>
                        {product.productType === option.value && <Check size={16} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>}
                </div>
              </div>
              <label className="form-group">Category
                {addingProductCategory ? (
                  <>
                    <input name="category" value={product.category} onChange={updateProduct} placeholder="Enter a new category" maxLength={80} autoFocus />
                    <button className="btn-secondary" type="button" onClick={() => setAddingProductCategory(false)}>Choose an existing category</button>
                  </>
                ) : (
                  <CustomSelect
                    ariaLabel="Product category"
                    value={product.category}
                    options={[
                      { value: '', label: 'Select a category' },
                      ...[...new Set([...productCategories, product.category].filter((category) => typeof category === 'string' && category.trim()))]
                        .sort((left, right) => left.localeCompare(right))
                        .map((category) => ({ value: category, label: category })),
                      { value: '__add_category__', label: 'Add a new category…' },
                    ]}
                    onChange={(category) => {
                      productContentRevision.current += 1
                      setProductError('')
                      if (category === '__add_category__') {
                        setProduct((current) => ({ ...current, category: '' }))
                        setAddingProductCategory(true)
                      } else {
                        setProduct((current) => ({ ...current, category }))
                      }
                    }}
                  />
                )}
              </label>
              {product.productType === 'product' ? (
                <>
                  <label className="form-group">Stock<input name="stock" type="number" min="0" step="1" value={product.stock} onChange={updateProduct} required /></label>
                  <div className="ecom-product-form-row">
                    <label className="form-group">Selling price (NGN)<input name="price" type="number" min="1" step="0.01" value={product.price} onChange={updateProduct} required /></label>
                    <label className="form-group">Discount (%) (optional)<input name="discountPercent" type="number" min="0" max="99.99" step="0.01" value={product.discountPercent} onChange={updateProduct} placeholder="e.g. 10" /></label>
                  </div>
                  <fieldset className="ecom-product-condition-fieldset">
                    <legend>Product condition</legend>
                    <label><input type="radio" name="product-condition" value="brand_new" checked={product.condition === 'brand_new'} onChange={() => setProduct((current) => ({ ...current, condition: 'brand_new' }))} /> Brand new</label>
                    <label><input type="radio" name="product-condition" value="used" checked={product.condition === 'used'} onChange={() => setProduct((current) => ({ ...current, condition: 'used' }))} /> Used</label>
                    <label className="ecom-product-sold-toggle"><input type="checkbox" checked={product.isSold} onChange={(event) => setProduct((current) => ({ ...current, isSold: event.target.checked }))} /> Mark as sold</label>
                  </fieldset>
                  <label className="form-group">Expected delivery<input name="expectedDelivery" value={product.expectedDelivery} onChange={updateProduct} maxLength={120} placeholder="e.g. 3–5 business days" /></label>
                </>
              ) : (
                <section className="ecom-digital-product-fields">
                  {product.productType === 'website' ? (
                    <label className="form-group">Live website URL<input name="websiteUrl" type="url" value={product.websiteUrl} onChange={updateProduct} required placeholder="https://example.com" /></label>
                  ) : product.productType === 'app' ? (
                    <>
                      <label className="form-group">Hosted Android APK URL<input name="apkUrl" type="url" value={product.apkUrl} onChange={updateProduct} required placeholder="https://downloads.example.com/app.apk" /></label>
                      <label className="form-group">Website URL (optional)<input name="websiteUrl" type="url" value={product.websiteUrl} onChange={updateProduct} placeholder="https://example.com" /></label>
                    </>
                  ) : product.productType === 'ios_app' ? (
                    <>
                      <label className="form-group">Hosted iOS app URL<input name="iosAppUrl" type="url" value={product.iosAppUrl} onChange={updateProduct} required placeholder="https://apps.example.com/ios-app" /></label>
                      <label className="form-group">Website URL (optional)<input name="websiteUrl" type="url" value={product.websiteUrl} onChange={updateProduct} placeholder="https://example.com" /></label>
                    </>
                  ) : (
                    <label className="form-group">{product.productType === 'admin' ? 'Admin dashboard URL' : 'Live full-stack application URL'}<input name="websiteUrl" type="url" value={product.websiteUrl} onChange={updateProduct} required placeholder="https://example.com" /></label>
                  )}
                  <div className="ecom-product-form-row">
                    <label className="form-group">Use / rental price (NGN)<input name="usePrice" type="number" min="0" step="1" value={product.usePrice} onChange={updateProduct} placeholder="0 to disable" /></label>
                    <label className="form-group">Full template price (NGN)<input name="templatePrice" type="number" min="0" step="1" value={product.templatePrice} onChange={updateProduct} placeholder="Includes backend + 2-week setup" /></label>
                  </div>
                  <div className="form-group">Rental source-code archive (ZIP), optional<label className={`ecom-upload-image-button${uploadingSourceCode || savingProduct ? ' is-disabled' : ''}`}><Upload size={14} /><span>{uploadingSourceCode ? 'Uploading ZIP…' : product.sourceCodeUrl ? 'Replace rental ZIP' : 'Choose rental ZIP'}</span><input aria-label="Choose rental source-code ZIP" type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={uploadingSourceCode || savingProduct} onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (!file) return; if (!file.name.toLowerCase().endsWith('.zip') || file.size > 100 * 1024 * 1024) { setProductError('Choose a ZIP source-code archive up to 100 MB.'); return } void uploadProductSourceCode(file, 'sourceCodeUrl') }} /></label><small>{uploadingSourceCode ? 'Uploading rental archive…' : product.sourceCodeUrl ? 'Rental archive uploaded. Buyers who paid for Use / rental can download it.' : 'Optional ZIP made available to buyers who pay for Use / rental.'}</small></div>
                  <div className="form-group">Full-template source-code archive (ZIP), optional<label className={`ecom-upload-image-button${uploadingTemplateSourceCode || savingProduct ? ' is-disabled' : ''}`}><Upload size={14} /><span>{uploadingTemplateSourceCode ? 'Uploading ZIP…' : product.templateSourceCodeUrl ? 'Replace full-template ZIP' : 'Choose full-template ZIP'}</span><input aria-label="Choose full-template source-code ZIP" type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={uploadingTemplateSourceCode || savingProduct} onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (!file) return; if (!file.name.toLowerCase().endsWith('.zip') || file.size > 100 * 1024 * 1024) { setProductError('Choose a ZIP source-code archive up to 100 MB.'); return } void uploadProductSourceCode(file, 'templateSourceCodeUrl') }} /></label><small>{uploadingTemplateSourceCode ? 'Uploading full-template archive…' : product.templateSourceCodeUrl ? 'Full-template archive uploaded. Buyers who purchase the full template can download it.' : 'Optional separate ZIP for buyers who purchase the full template.'}</small></div>
                  <div className="ecom-product-documents">
                    <span className="ecom-product-documents-title">Buyer files <small>Any file type is supported. Buyers can download files after payment.</small></span>
                    <label className={`ecom-upload-image-button${uploadingDocuments || savingProduct || product.documents.length >= 10 ? ' is-disabled' : ''}`}>
                      <FileText size={14} />
                      <span>{uploadingDocuments ? 'Uploading files…' : product.documents.length ? 'Add more files' : 'Choose files'}</span>
                      <input aria-label="Upload buyer files" type="file" multiple disabled={uploadingDocuments || savingProduct || product.documents.length >= 10} onChange={(event) => { const files = Array.from(event.currentTarget.files || []); event.currentTarget.value = ''; if (files.length) void uploadProductDocuments(files) }} />
                    </label>
                    {product.documents.map((document, index) => (
                      <div className="ecom-product-document" key={document.url}>
                        <FileText size={14} /><span>{document.name}</span>
                        <span className="ecom-product-document-status"><Check size={12} /> Uploaded</span>
                        <button type="button" className="ecom-remove-image-button" aria-label={`Remove ${document.name}`} disabled={uploadingDocuments || savingProduct} onClick={() => setProduct((current) => ({ ...current, documents: current.documents.filter((_, documentIndex) => documentIndex !== index) }))}><X size={14} /></button>
                      </div>
                    ))}
                    {documentUploadFeedback.filter((upload) => upload.fieldName === 'documents').map((upload) => (
                      <div className={`ecom-product-document ecom-product-document-pending ${upload.status === 'failed' ? 'has-error' : ''}`} key={upload.id} role={upload.status === 'failed' ? 'alert' : 'status'}>
                        <FileText size={14} /><span>{upload.name}</span>
                        <span className="ecom-product-document-status">{upload.status === 'uploading' ? 'Uploading…' : upload.error || 'Upload failed'}</span>
                        {upload.status === 'failed' && <button type="button" className="ecom-remove-image-button" aria-label={`Dismiss ${upload.name} upload error`} onClick={() => setDocumentUploadFeedback((current) => current.filter((entry) => entry.id !== upload.id))}><X size={14} /></button>}
                      </div>
                    ))}
                    <small aria-live="polite">{product.documents.length ? `${product.documents.length} of 10 files uploaded` : 'No files uploaded'} · Any file type, 20 MB maximum per file.</small>
                  </div>
                  <div className="ecom-product-documents">
                    <span className="ecom-product-documents-title">Full-template legal documents <small>Only buyers who purchase the full template can download these files.</small></span>
                    <label className={`ecom-upload-image-button${uploadingDocuments || savingProduct || product.templateDocuments.length >= 10 ? ' is-disabled' : ''}`}>
                      <FileText size={14} />
                      <span>{uploadingDocuments ? 'Uploading files…' : product.templateDocuments.length ? 'Add more legal documents' : 'Choose legal documents'}</span>
                      <input aria-label="Upload full-template legal documents" type="file" multiple disabled={uploadingDocuments || savingProduct || product.templateDocuments.length >= 10} onChange={(event) => { const files = Array.from(event.currentTarget.files || []); event.currentTarget.value = ''; if (files.length) void uploadProductDocuments(files, 'templateDocuments') }} />
                    </label>
                    {product.templateDocuments.map((document, index) => (
                      <div className="ecom-product-document" key={document.url}>
                        <FileText size={14} /><span>{document.name}</span>
                        <span className="ecom-product-document-status"><Check size={12} /> Uploaded</span>
                        <button type="button" className="ecom-remove-image-button" aria-label={`Remove ${document.name}`} disabled={uploadingDocuments || savingProduct} onClick={() => setProduct((current) => ({ ...current, templateDocuments: current.templateDocuments.filter((_, documentIndex) => documentIndex !== index) }))}><X size={14} /></button>
                      </div>
                    ))}
                    {documentUploadFeedback.filter((upload) => upload.fieldName === 'templateDocuments').map((upload) => (
                      <div className={`ecom-product-document ecom-product-document-pending ${upload.status === 'failed' ? 'has-error' : ''}`} key={upload.id} role={upload.status === 'failed' ? 'alert' : 'status'}>
                        <FileText size={14} /><span>{upload.name}</span>
                        <span className="ecom-product-document-status">{upload.status === 'uploading' ? 'Uploading…' : upload.error || 'Upload failed'}</span>
                        {upload.status === 'failed' && <button type="button" className="ecom-remove-image-button" aria-label={`Dismiss ${upload.name} upload error`} onClick={() => setDocumentUploadFeedback((current) => current.filter((entry) => entry.id !== upload.id))}><X size={14} /></button>}
                      </div>
                    ))}
                    <small aria-live="polite">{product.templateDocuments.length ? `${product.templateDocuments.length} of 10 legal documents uploaded` : 'No legal documents uploaded'} · Any file type, 20 MB maximum per file.</small>
                  </div>
                  <label className="form-group">Usage and setup instructions<textarea name="usageInstructions" rows="5" value={product.usageInstructions} onChange={updateProduct} maxLength={5000} required placeholder="Explain how buyers can use this item and what setup/support is included." /></label>
                </section>
              )}
              {product.productType === 'product' && <div className="ecom-product-images">
                <div className="ecom-product-images-heading">
                  <span>Available colors <small>Customers must choose one before adding this product to their cart.</small></span>
                  <button
                    type="button"
                    className="ecom-add-image-button"
                    disabled={product.colors.length >= 30}
                    onClick={() => setProduct((current) => ({ ...current, colors: [...current.colors, ''] }))}
                  ><Plus size={14} /> Add color</button>
                </div>
                {product.colors.map((color, index) => (
                  <div className="ecom-product-image-field ecom-product-color-field" key={`product-color-${index}`}>
                    <label className="form-group">Color {index + 1}<input type="color" value={normalizeProductColor(color)} aria-label={`Choose color ${index + 1}`} onChange={(event) => updateProductColor(index, event.target.value)} /></label>
                    {product.colors.length > 1 && (
                      <button type="button" className="ecom-remove-image-button" aria-label={`Remove color ${index + 1}`} onClick={() => setProduct((current) => ({ ...current, colors: current.colors.filter((_, colorIndex) => colorIndex !== index) }))}><X size={15} /></button>
                    )}
                  </div>
                ))}
              </div>}
              <div className="ecom-product-images">
                <div className="ecom-product-images-heading">
                  <span>Product images <small>The first image is the main product photo.</small></span>
                  <button
                    type="button"
                    className="ecom-add-image-button"
                    disabled={product.images.length >= 8}
                    onClick={() => setProduct((current) => ({ ...current, images: [...current.images, ''] }))}
                  >
                    <ImagePlus size={14} /> Add image
                  </button>
                </div>
                {product.images.map((image, index) => (
                  <div className="ecom-product-image-field" key={`product-image-${index}`}>
                    <label className="form-group">
                      {index === 0 ? 'Main image URL' : `Additional image ${index}`}
                      <input type="url" value={image} onChange={(event) => updateProductImage(index, event.target.value)} placeholder="https://..." />
                    </label>
                    <label className={`ecom-upload-image-button${uploadingImageIndex !== null || savingProduct ? ' is-disabled' : ''}`}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        disabled={uploadingImageIndex !== null || savingProduct}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0]
                          event.currentTarget.value = ''
                          if (file) void uploadProductImage(index, file)
                        }}
                      />
                      <ImagePlus size={13} />
                      <span>{uploadingImageIndex === index ? 'Uploading…' : 'Choose file'}</span>
                    </label>
                    {index > 0 && (
                      <button
                        type="button"
                        className="ecom-remove-image-button"
                        aria-label={`Remove additional image ${index}`}
                        onClick={() => setProduct((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))}
                      ><X size={15} /></button>
                    )}
                  </div>
                ))}
                <small className="ecom-product-images-hint">Add up to 8 product views. Shoppers can switch between them on the product page.</small>
              </div>
              <label className="form-group">Product description<textarea name="description" rows="3" value={product.description} onChange={updateProduct} maxLength={5000} placeholder="Describe the product and its main purpose." /></label>
              {product.productType === 'product' && <div className="ecom-product-images">
                <div className="ecom-product-images-heading">
                  <span>Key highlights <small>Shown as individual highlights on app and website product pages.</small></span>
                  <button
                    type="button"
                    className="ecom-add-image-button"
                    disabled={product.keyHighlights.length >= 30}
                    onClick={() => setProduct((current) => ({ ...current, keyHighlights: [...current.keyHighlights, ''] }))}
                  ><Plus size={14} /> Add highlight</button>
                </div>
                {product.keyHighlights.map((highlight, index) => (
                  <div className="ecom-product-image-field ecom-product-highlight-field" key={`product-highlight-${index}`}>
                    <label className="form-group">Highlight {index + 1}<input value={highlight} maxLength={300} onChange={(event) => updateProductHighlight(index, event.target.value)} /></label>
                    {product.keyHighlights.length > 1 && (
                      <button type="button" className="ecom-remove-image-button" aria-label={`Remove highlight ${index + 1}`} onClick={() => setProduct((current) => ({ ...current, keyHighlights: current.keyHighlights.filter((_, highlightIndex) => highlightIndex !== index) }))}><X size={15} /></button>
                    )}
                  </div>
                ))}
              </div>}
              {product.productType === 'product' && <div className="ecom-product-images">
                <div className="ecom-product-images-heading">
                  <span>Specifications <small>These are displayed in a two-column table.</small></span>
                  <button
                    type="button"
                    className="ecom-add-image-button"
                    disabled={product.specifications.length >= 50}
                    onClick={() => setProduct((current) => ({ ...current, specifications: [...current.specifications, { label: '', value: '' }] }))}
                  ><Plus size={14} /> Add specification</button>
                </div>
                {product.specifications.map((specification, index) => (
                  <div className="ecom-product-image-field ecom-product-specification-field" key={`product-specification-${index}`}>
                    <label className="form-group">Specification {index + 1}<input value={specification.label} maxLength={80} placeholder="e.g. Brand" onChange={(event) => updateProductSpecification(index, 'label', event.target.value)} /></label>
                    <label className="form-group">Value<input value={specification.value} maxLength={500} placeholder="e.g. Samsung" onChange={(event) => updateProductSpecification(index, 'value', event.target.value)} /></label>
                    {product.specifications.length > 1 && (
                      <button type="button" className="ecom-remove-image-button" aria-label={`Remove specification ${index + 1}`} onClick={() => setProduct((current) => ({ ...current, specifications: current.specifications.filter((_, specificationIndex) => specificationIndex !== index) }))}><X size={15} /></button>
                    )}
                  </div>
                ))}
              </div>}
              {product.productType === 'product' && <label className="form-group">Packaging details<textarea name="packagingDetails" rows="4" value={product.packagingDetails} onChange={updateProduct} maxLength={5000} placeholder="Describe the retail packaging and list the items included." /></label>}
              <label className="form-group">Search tags<input name="tags" value={product.tags} onChange={updateProduct} placeholder="Separate tags with commas" /></label>
              <label className="ecom-product-active-toggle">
                <input type="checkbox" checked={product.isActive} onChange={(event) => setProduct((current) => ({ ...current, isActive: event.target.checked }))} />
                <span>Visible to customers</span>
              </label>
              {productError && <p className="wallet-notice error" role="alert"><AlertCircle size={15} />{productError}</p>}
              <div className="modal-actions">
                <button className="btn-secondary" type="button" disabled={savingProduct} onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={savingProduct || uploadingSourceCode || uploadingTemplateSourceCode || uploadingDocuments}>{savingProduct ? (editingProductId ? 'Saving changes…' : 'Adding product…') : (editingProductId ? 'Save changes' : 'Add product')}</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {shopReviewTarget && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !reviewingShopId) setShopReviewTarget(null) }}>
          <section className="modal-content ecom-shop-review-modal" role="dialog" aria-modal="true" aria-labelledby="shop-review-title">
            <header className="modal-header">
              <div>
                <h2 id="shop-review-title">Request changes</h2>
                <p>Explain what {shopReviewTarget.businessName} needs to update before approval.</p>
              </div>
              <button className="btn-close" type="button" aria-label="Close" disabled={Boolean(reviewingShopId)} onClick={() => setShopReviewTarget(null)}><X size={18} /></button>
            </header>
            <form className="modal-body ecom-shop-review-form" onSubmit={requestShopChanges}>
              <label className="form-group" htmlFor="shop-review-note">Review notes</label>
              <textarea
                id="shop-review-note"
                value={shopReviewNote}
                onChange={(event) => setShopReviewNote(event.target.value)}
                minLength={5}
                maxLength={2000}
                rows={5}
                required
                autoFocus
                placeholder="Describe the changes the business owner should make."
              />
              {shopApplicationsError && <p className="wallet-notice error" role="alert">{shopApplicationsError}</p>}
              <div className="modal-actions">
                <button className="btn-secondary" type="button" disabled={Boolean(reviewingShopId)} onClick={() => setShopReviewTarget(null)}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={Boolean(reviewingShopId) || shopReviewNote.trim().length < 5}>{reviewingShopId ? 'Submitting…' : 'Send change request'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {productToDelete && (
        <div className="modal-backdrop ecom-delete-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingProductId) setProductToDelete(null) }}>
          <section className="modal-content ecom-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" aria-describedby="delete-product-description">
            <div className="ecom-delete-icon"><Trash2 size={21} /></div>
            <h2 id="delete-product-title">Delete product?</h2>
            <p id="delete-product-description">“{productToDelete.name}” will be removed from the store catalog. Existing order records will remain unchanged.</p>
            {productsError && <p className="wallet-notice error" role="alert">{productsError}</p>}
            <div className="ecom-delete-actions">
              <button className="btn-secondary" type="button" disabled={Boolean(deletingProductId)} onClick={() => setProductToDelete(null)}>Cancel</button>
              <button className="ecom-delete-confirm" type="button" disabled={Boolean(deletingProductId)} onClick={deleteProduct}>
                <Trash2 size={14} />{deletingProductId ? 'Deleting…' : 'Delete product'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
