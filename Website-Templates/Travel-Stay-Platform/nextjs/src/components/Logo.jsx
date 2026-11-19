export default function Logo({ light = false }) {
  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="Escapes home">
      <img src="/favicon.svg" alt="" />
      <span>Escapes</span>
    </a>
  )
}
