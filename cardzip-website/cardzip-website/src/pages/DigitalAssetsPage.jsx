import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Code2, Globe2, Search, Smartphone } from 'lucide-react'
import { userApi } from '../services/api'
import { getStorefrontPreferences, recordStoreSearch } from '../services/storePreferences'
import { formatNaira } from '../utils/currency'
import CardzipLoader from '../components/CardzipLoader'
import './DigitalAssets.css'

const typeLabels = { website: 'Website', app: 'Android app', ios_app: 'iOS app', full_stack: 'Full stack', admin: 'Admin' }

export default function DigitalAssetsPage({ onNavigate }) {
  const [productType, setProductType] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const types = productType === 'all' ? ['website', 'app', 'ios_app', 'full_stack', 'admin'] : [productType]
    const preferences = getStorefrontPreferences()
    Promise.all(types.map((type) => {
      const query = new URLSearchParams({ productType: type, page: '1', limit: '50', sort: 'featured' })
      if (searchTerm) query.set('search', searchTerm)
      query.set('preferences', JSON.stringify(preferences))
      return userApi.storeProducts(`?${query.toString()}`)
    }))
      .then((results) => {
        if (active) setAssets(results.flatMap((result) => result.data || []))
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load websites and apps.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [productType, searchTerm])

  const submitSearch = (event) => {
    event.preventDefault()
    const term = searchInput.trim().slice(0, 100)
    if (term) recordStoreSearch(term)
    setError('')
    setLoading(true)
    setSearchTerm(term)
  }

  return (
    <main className="digital-assets-page">
      <div className="digital-assets-shell">
        <button className="digital-back-link" type="button" onClick={() => onNavigate?.('/shop')}><ArrowLeft size={15} /> Back to store</button>
        <header className="digital-assets-hero">
          <span className="digital-assets-kicker">CARDZIP DIGITAL STUDIO</span>
          <h1>Websites and apps, ready for your next idea.</h1>
          <p>Explore websites and iOS or Android apps, choose a use option, or request the complete project template with backend and guided setup.</p>
          <div className="digital-assets-promise"><Code2 size={17} /> Templates include a two-week setup and upload handover.</div>
          <button type="button" className="digital-sell-cta" onClick={() => onNavigate?.('/digital-assets/sell')}>Sell your website or app <ArrowRight size={15} /></button>
        </header>
        <div className="digital-assets-filters" role="group" aria-label="Filter digital products">
          {[['all', 'All digital products'], ['website', 'Websites'], ['app', 'Android apps'], ['ios_app', 'iOS apps'], ['full_stack', 'Full stack'], ['admin', 'Admin']].map(([value, label]) => (
            <button key={value} type="button" className={productType === value ? 'active' : ''} aria-pressed={productType === value} onClick={() => { if (productType !== value) { setLoading(true); setError(''); setProductType(value) } }}>{label}</button>
          ))}
        </div>
        <form className="digital-assets-search" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="digital-assets-search">Search websites and apps</label>
          <input id="digital-assets-search" type="search" maxLength={100} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search templates, apps, or categories" />
          <button type="submit"><Search size={15} /> Search</button>
          {searchTerm && <button type="button" className="digital-assets-clear-search" onClick={() => { setSearchInput(''); setSearchTerm(''); setLoading(true); setError('') }}>Clear</button>}
        </form>
        {error && <p className="digital-assets-error" role="alert">{error}</p>}
        {loading ? <p className="digital-assets-state" role="status"><CardzipLoader compact label="Loading digital products" /></p> : null}
        {!loading && !error && assets.length === 0 ? <div className="digital-assets-empty"><Code2 size={28} /><strong>{searchTerm ? 'No matching websites or apps' : 'New digital products are on the way'}</strong><span>{searchTerm ? 'Try a different search term or clear your search.' : 'Check back soon for websites and apps curated by Cardzip.'}</span>{searchTerm && <button type="button" onClick={() => { setSearchInput(''); setSearchTerm(''); setLoading(true) }}>Clear search</button>}</div> : null}
        <section className="digital-assets-grid" aria-label="Websites and apps">
          {assets.map((asset) => {
            const Icon = ['website', 'full_stack', 'admin'].includes(asset.productType) ? Globe2 : Smartphone
            const sellerPrices = [Number(asset.usePrice), Number(asset.templatePrice)].filter((value) => value > 0)
            const price = asset.isSellerListing
              ? (sellerPrices.length ? sellerPrices : Number(asset.price) > 0 ? [Number(asset.price)] : [])
              : sellerPrices
            return (
              <article className="digital-asset-card" key={asset._id}>
                <div className="digital-asset-card-image">{asset.image ? <img src={asset.image} alt="" loading="lazy" /> : <Icon size={32} />}{asset.isPromoted && <span className="digital-asset-promoted">PROMOTED</span>}</div>
                <div className="digital-asset-card-content">
                  <span className="digital-asset-type"><Icon size={13} /> {typeLabels[asset.productType] || 'Digital product'}</span>
                  <h2>{asset.name}</h2>
                  <p>{asset.description || asset.usageInstructions || 'Explore details, use options, and setup support.'}</p>
                  <div className="digital-asset-price">{price.length ? `Options from ${formatNaira(Math.min(...price))}` : 'Contact for options'}</div>
                  <button type="button" className="digital-asset-open" onClick={() => onNavigate?.(`/digital-assets/${encodeURIComponent(asset.slug)}`)}>Explore details <ArrowRight size={15} /></button>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}
