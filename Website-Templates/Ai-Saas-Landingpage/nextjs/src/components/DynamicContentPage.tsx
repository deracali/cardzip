import { ArrowRight } from 'lucide-react';
import { Footer } from './Shared';
import type { NexaraPage } from '../services/nexara-api';

export default function DynamicContentPage({ page }: { page: NexaraPage }) {
  return <><main className="cms-page">
    <header className="cms-hero">
      {page.eyebrow && <span className="eyebrow">{page.eyebrow}</span>}
      <h1>{page.title}</h1>
      {page.description && <p>{page.description}</p>}
    </header>
    {page.sections.map((section, index) => <section className="cms-section" key={`${section.title || 'section'}-${index}`}>
      {section.title && <h2>{section.title}</h2>}
      {section.body && <p>{section.body}</p>}
      {section.items?.length ? <div className="cms-cards">{section.items.map((item, itemIndex) => {
        const content = <><h3>{item.title}</h3>{item.body && <p>{item.body}</p>}{item.href && <span className="text-link">Learn more <ArrowRight size={14} /></span>}</>;
        return item.href
          ? <a className="cms-card" href={item.href} key={`${item.title || 'item'}-${itemIndex}`} target={item.href.startsWith('https://') ? '_blank' : undefined} rel={item.href.startsWith('https://') ? 'noreferrer' : undefined}>{content}</a>
          : <article className="cms-card" key={`${item.title || 'item'}-${itemIndex}`}>{content}</article>;
      })}</div> : null}
    </section>)}
  </main><Footer /></>;
}
