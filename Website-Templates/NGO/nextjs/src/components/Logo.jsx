export default function Logo({ light = false }) {
  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="Kindred home">
      <img src="/favicon.svg" alt="" />
      <span><strong>Kindred.</strong><small>Give hope. Change lives.</small></span>
    </a>
  )
}
