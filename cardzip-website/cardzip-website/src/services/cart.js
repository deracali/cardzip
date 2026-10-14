const CART_KEY = 'cardzip-store-cart'

export const getCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Could not read saved cart:', error)
    return []
  }
}

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cardzip-cart-change'))
  return items
}

export const addToCart = (product, quantity = 1) => {
  const cart = getCart()
  const existing = cart.find((item) => item.productId === product._id)
  if (existing) {
    return saveCart(cart.map((item) => item.productId === product._id
      ? { ...item, quantity: Math.min(100, item.quantity + quantity) }
      : item))
  }
  return saveCart([...cart, {
    productId: product._id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    image: product.image || '',
    quantity,
  }])
}

export const updateCartQuantity = (productId, quantity) => {
  const cart = getCart()
  if (quantity < 1) return saveCart(cart.filter((item) => item.productId !== productId))
  return saveCart(cart.map((item) => item.productId === productId ? { ...item, quantity: Math.min(100, quantity) } : item))
}

export const removeFromCart = (productId) => saveCart(getCart().filter((item) => item.productId !== productId))
export const clearCart = () => saveCart([])
