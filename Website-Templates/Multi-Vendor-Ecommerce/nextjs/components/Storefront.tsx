"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { marketplaceApi, type MarketProduct } from "../lib/marketplaceApi";

export default function Storefront({ all = false }: { all?: boolean }) {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    marketplaceApi.products()
      .then((result) => { if (active) setProducts(result.products); })
      .catch((requestError: Error) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleProducts = all ? products : products.slice(0, 6);
  return <main className="market-main">
    {!all && <section className="market-hero">
      <span className="market-eyebrow">GOOD THINGS, MADE BY GOOD PEOPLE</span>
      <h1>Find your next<br /><em>favorite thing.</em></h1>
      <p>Thoughtful finds and everyday essentials from independent shops worth knowing.</p>
      <div className="market-hero-actions"><Link className="market-button market-button-primary" href="/products">Explore the marketplace</Link><Link className="market-button market-button-secondary" href="/signup?accountType=vendor">Sell on MarketHub</Link></div>
    </section>}
    <section className="market-catalog">
      <div className="market-section-heading"><div><span className="market-eyebrow">THE MARKETPLACE</span><h2>{all ? "Shop all the good things" : "A few thoughtful finds"}</h2></div><Link href="/products">Browse all products</Link></div>
      {loading && <p className="market-state" role="status">Loading products…</p>}
      {error && <p className="market-error" role="alert">{error}</p>}
      {!loading && !error && !visibleProducts.length && <p className="market-state">No active listings yet. Check back soon.</p>}
      <div className="market-product-grid">{visibleProducts.map((product) => <Link className="market-product-card" href={`/products/${encodeURIComponent(product.slug)}`} key={product.id}>
        <div className="market-product-image">{product.image ? <img src={product.image} alt="" /> : <span aria-hidden="true">MH</span>}</div>
        <div className="market-product-info"><span>{product.category} · {product.seller}</span><strong>{product.name}</strong><b>${Number(product.price).toFixed(2)}</b></div>
      </Link>)}</div>
    </section>
  </main>;
}
