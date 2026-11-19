"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getMarketplaceSession, marketplaceApi, type MarketPaymentProvider, type MarketProduct } from "../lib/marketplaceApi";

export default function ProductDetails({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<MarketProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<MarketPaymentProvider[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [selectedProvider, setSelectedProvider] = useState<MarketPaymentProvider["id"]>("paystack");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    let active = true;
    marketplaceApi.products()
      .then((result) => {
        const found = result.products.find((item) => item.slug === slug);
        if (active && found) setProduct(found);
        else if (active) setError("This product is no longer available.");
      })
      .catch((requestError: Error) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    let active = true;
    marketplaceApi.paymentProviders()
      .then((result) => {
        if (!active) return;
        const enabledProviders = result.providers.filter((provider) => provider.enabled);
        setProviders(enabledProviders);
        setCurrency(result.currency);
        if (enabledProviders.length) setSelectedProvider(enabledProviders[0].id);
      })
      .catch((requestError: Error) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, []);

  const beginCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || !providers.some((provider) => provider.id === selectedProvider)) return;
    const session = getMarketplaceSession();
    if (!session?.token) {
      router.push(`/login?redirect=${encodeURIComponent(`/products/${slug}`)}`);
      return;
    }
    if (session.user.role !== "client") {
      setError("Only customer accounts can place marketplace orders.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get("quantity"));
    setCheckoutLoading(true);
    setError("");
    try {
      const result = await marketplaceApi.createCheckout({
        provider: selectedProvider,
        items: [{ productId: product.id, quantity }],
        shippingMethod: "standard",
        shippingAddress: {
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          address: String(form.get("address") || ""),
          city: String(form.get("city") || ""),
          state: String(form.get("state") || ""),
          postalCode: String(form.get("postalCode") || ""),
          country: String(form.get("country") || ""),
        },
      });
      window.location.assign(result.checkoutUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not start secure checkout.");
      setCheckoutLoading(false);
    }
  };

  if (loading) return <main className="market-main"><p className="market-state">Loading product…</p></main>;
  if (!product) return <main className="market-main"><p className="market-error" role="alert">{error}</p><Link href="/products">Browse all products</Link></main>;

  return <main className="market-product-detail">
    <Link href="/products" className="market-back-link">← Back to products</Link>
    <section className="market-product-detail-card">
      <div className="market-product-detail-image">{product.image ? <img src={product.image} alt={product.name} /> : <span>MarketHub</span>}</div>
      <div className="market-product-detail-copy"><span className="market-eyebrow">{product.category} · {product.seller}</span><h1>{product.name}</h1><strong>${product.price.toFixed(2)}</strong><p>{product.description || "A thoughtful find from an independent MarketHub seller."}</p><p>{product.stock} currently available</p>
        <form className="market-form" onSubmit={beginCheckout}>
          <h2>Secure checkout</h2>
          <label>Quantity<input name="quantity" type="number" min="1" max={Math.min(product.stock, 20)} defaultValue="1" required /></label>
          <label>Full name<input name="name" autoComplete="name" required minLength={2} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Street address<input name="address" autoComplete="street-address" required minLength={4} /></label>
          <div className="market-form-pair"><label>City<input name="city" autoComplete="address-level2" required /></label><label>State / region<input name="state" autoComplete="address-level1" required /></label></div>
          <div className="market-form-pair"><label>ZIP / postal code<input name="postalCode" autoComplete="postal-code" required /></label><label>Country<input name="country" autoComplete="country-name" required /></label></div>
          {providers.length > 0 && <fieldset className="market-payment-options">
            <legend>Payment provider · {currency}</legend>
            {providers.map((provider) => <label key={provider.id} className="market-payment-option">
              <input
                type="radio"
                name="paymentProvider"
                value={provider.id}
                checked={selectedProvider === provider.id}
                onChange={() => setSelectedProvider(provider.id)}
              />
              <span>{provider.name}</span>
            </label>)}
          </fieldset>}
          {error && <p className="market-error" role="alert">{error}</p>}
          {providers.length > 0
            ? <button className="market-button market-button-primary" disabled={checkoutLoading || !product.stock}>
              {checkoutLoading ? "Connecting to provider…" : "Continue to payment"}
            </button>
            : <p className="market-payment-unavailable">Secure checkout is not configured for {currency}. Please contact the store administrator.</p>}
          <small>Prices are calculated by the server. Card and bank details are entered only on the provider’s secure checkout.</small>
        </form>
      </div>
    </section>
  </main>;
}
