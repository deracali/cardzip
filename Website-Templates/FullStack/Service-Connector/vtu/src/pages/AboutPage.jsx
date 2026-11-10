import { ArrowRight, Banknote, CreditCard, Globe, Megaphone, ShieldCheck, ShoppingBag, Store, UsersRound, Wallet, Code2 } from 'lucide-react'
import AppDownloadFooter from '../components/AppDownloadFooter'
import '../components/HomeExperience.css'

const services = [
  {
    icon: CreditCard,
    title: 'Gift cards',
    description: 'Explore supported gift-card brands, check the available trade options and follow the submission steps.',
    steps: ['Choose a supported brand and card type.', 'Review the quote and instructions shown for your card.', 'Submit the details requested and track the review.'],
    destination: '/gift-cards',
    action: 'Explore gift cards',
  },
  {
    icon: ShoppingBag,
    title: 'Store products',
    description: 'Shop products listed in the Cardzip store and manage your orders from your account.',
    steps: ['Browse products and open a listing for its details.', 'Add the items you want and proceed to checkout.', 'Choose an available payment option and review your order.'],
    destination: '/shop',
    action: 'Browse the store',
  },
  {
    icon: UsersRound,
    title: 'Community marketplace',
    description: 'Discover listings shared by community members. Buyers and sellers can connect directly about a listing.',
    steps: ['Search or browse the marketplace.', 'Review the listing and contact the seller using its provided details.', 'Sellers can sign in to manage their own listings.'],
    destination: '/community-market',
    action: 'Visit community market',
  },
  {
    icon: Store,
    title: 'Business shops',
    description: 'Find seller storefronts and explore products offered by each business.',
    steps: ['Browse the directory of available shops.', 'Open a shop to see that business’s products.', 'Contact the shop through the contact options on a listing.'],
    destination: '/shops',
    action: 'Find a business shop',
  },
  {
    icon: Code2,
    title: 'Websites and apps',
    description: 'Explore digital products, including websites, mobile apps and project templates.',
    steps: ['Browse the digital listings and open a product for its details.', 'Check the listing for what is included and the available purchase options.', 'Sellers can submit a website or app for review before publication.'],
    destination: '/digital-assets',
    action: 'Explore digital products',
  },
  {
    icon: Banknote,
    title: 'Bills and utilities',
    description: 'Use the available bill services for supported airtime, data, electricity, television and other payments.',
    steps: ['Choose the service and provider.', 'Enter the required account or customer details and amount.', 'Review the information and confirm payment.'],
    destination: '/bills',
    action: 'View bill services',
  },
  {
    icon: Globe,
    title: 'Virtual numbers',
    description: 'Browse available virtual numbers for receiving supported verification messages.',
    steps: ['Choose a listed service and available number.', 'Review the rental details before continuing.', 'View received messages in your account.'],
    destination: '/virtual-numbers',
    action: 'Explore numbers',
  },
  {
    icon: Wallet,
    title: 'Wallet',
    description: 'Keep track of supported Cardzip transactions and manage your wallet from your account.',
    steps: ['Sign in to view your balance and wallet history.', 'Choose an available wallet action.', 'Review any fees, timing or instructions before confirming.'],
    destination: '/wallet',
    action: 'Open wallet',
  },
  {
    icon: Megaphone,
    title: 'Business advertising',
    description: 'Promote a business through the Cardzip advertising placements available to eligible advertisers.',
    steps: ['Review available placements and prices.', 'Submit campaign details and creative for review.', 'Track campaign status from your account.'],
    destination: '/advertise',
    action: 'Explore advertising',
  },
]

export default function AboutPage({ onNavigate }) {
  return (
    <>
      <div className="about-page">
        <section className="about-intro">
          <span className="about-eyebrow">ABOUT CARDZIP</span>
          <h1>Your everyday digital economy, <span>all in one place.</span></h1>
          <p>Cardzip brings together gift-card trading, shopping, community listings, business storefronts, digital products, bills and virtual numbers. Sign in to access account-based services and manage your activity.</p>
          <div className="about-intro-actions">
            <button type="button" onClick={() => onNavigate?.('/shop')}>Explore Cardzip <ArrowRight size={16} /></button>
            <span><ShieldCheck size={16} /> Review the details shown before confirming a transaction.</span>
          </div>
          <div className="about-intro-orb about-intro-orb-one" />
          <div className="about-intro-orb about-intro-orb-two" />
        </section>

        <section className="about-services" aria-labelledby="about-services-title">
          <div className="about-section-heading">
            <div><span>WHAT YOU CAN DO</span><h2 id="about-services-title">Explore Cardzip services</h2></div>
            <p>Each service has its own page with current options, requirements and next steps.</p>
          </div>
          <div className="about-service-grid">
            {services.map(({ icon: Icon, title, description, steps, destination, action }) => (
              <article className="about-service-card" key={title}>
                <span className="about-service-icon"><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
                <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
                <button type="button" onClick={() => onNavigate?.(destination)}>{action}<ArrowRight size={15} /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="about-getting-started">
          <div><span>GETTING STARTED</span><h2>How to use Cardzip</h2><p>Start with the service you need, then follow the instructions provided on that service’s page.</p></div>
          <ol>
            <li><b>01</b><span><strong>Create or access your account</strong><small>Some services require sign-in. Account pages let you manage your orders, balance and activity.</small></span></li>
            <li><b>02</b><span><strong>Choose a service</strong><small>Browse the marketplace, select a bill, find a virtual number or explore the gift-card flow.</small></span></li>
            <li><b>03</b><span><strong>Review before you confirm</strong><small>Check the listing, price, provider details, payment options and any service-specific instructions.</small></span></li>
            <li><b>04</b><span><strong>Track your activity</strong><small>Use the relevant account page for order details, transaction records, wallet activity or seller management.</small></span></li>
          </ol>
        </section>
      </div>
      <AppDownloadFooter onNavigate={onNavigate} />
    </>
  )
}
