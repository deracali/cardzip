import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import ShopPage from './ShopPage'
import { getCart, removeFromCart, updateCartQuantity } from '../services/cart'
import { formatNaira } from '../utils/currency'

export default function ShopPageWithCart({ onNavigate, user }) {
  const [cart, setCart] = useState(getCart)
  useEffect(() => {
    const syncCart = () => setCart(getCart())
    window.addEventListener('cardzip-cart-change', syncCart)
    return () => window.removeEventListener('cardzip-cart-change', syncCart)
  }, [])
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])
  const quantityChanged = (item, quantity) => setCart(updateCartQuantity(item.productId, quantity))
  const remove = (item) => setCart(removeFromCart(item.productId))

  return (
    <div className="overlay-page-wrapper"><div className="dimmed-background"><ShopPage onNavigate={onNavigate} user={user} cartBackground /></div>
      <aside className="cart-drawer">
        <div className="drawer-header"><div><h2 className="drawer-title">Your cart</h2><p className="drawer-sub">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p></div><button type="button" className="close-btn" onClick={() => onNavigate?.('/shop')} aria-label="Close cart"><X size={18} /></button></div>
        <div className="cart-items-list">{cart.map((item) => <article className="cart-item" key={item.productId}>
          <div className="cart-img-box">{item.image && <img src={item.image} alt="" />}</div><div className="cart-item-info"><h4 className="cart-item-name">{item.name}</h4><span className="cart-item-variant">{item.category}</span>
            <div className="qty-picker"><button type="button" aria-label={`Decrease ${item.name}`} onClick={() => quantityChanged(item, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" aria-label={`Increase ${item.name}`} onClick={() => quantityChanged(item, item.quantity + 1)}><Plus size={13} /></button></div>
          </div><span className="cart-item-price">{formatNaira(item.price * item.quantity)}</span><button type="button" className="cart-remove-btn" aria-label={`Remove ${item.name}`} onClick={() => remove(item)}><Trash2 size={15} /></button>
        </article>)}</div>
        {cart.length ? <>
          <div className="cart-summary"><div className="sum-row"><span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span><span>{formatNaira(subtotal)}</span></div><div className="sum-row"><span>Shipping</span><span>{formatNaira(1500)}</span></div><div className="sum-row total-row"><span>Total before address</span><span className="total-amount">{formatNaira(subtotal + 1500)}</span></div>
            <button type="button" className="btn-emerald-checkout" onClick={() => onNavigate?.('/checkout')}><span>Proceed to Checkout</span><ArrowRight size={16} /></button><span className="secure-badge"><ShieldCheck size={12} /> Secure checkout · wallet or Paystack</span>
          </div>
        </> : <div className="cart-summary"><ShoppingBag size={26} /><p>Your cart is empty.</p><button type="button" className="btn-emerald-checkout" onClick={() => onNavigate?.('/shop')}>Browse products</button></div>}
        <button type="button" className="btn-continue-shopping" onClick={() => onNavigate?.('/shop')}>Continue shopping</button>
      </aside>
    </div>
  )
}
