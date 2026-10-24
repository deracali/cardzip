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

const isSameCartItem = (item, productId, selectedColor = '') => (
  item.productId === productId && (item.selectedColor || '') === selectedColor
)

export const addToCart = (product, quantity = 1, selectedColor = '') => {
  const cart = getCart()
  const existing = cart.find((item) => isSameCartItem(item, product._id, selectedColor))
  if (existing) {
    return saveCart(cart.map((item) => isSameCartItem(item, product._id, selectedColor)
      ? { ...item, quantity: Math.min(100, item.quantity + quantity) }
      : item))
  }
  return saveCart([...cart, {
    productId: product._id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    selectedColor,
    price: Number(product.price),
    image: product.image || '',
    quantity,
  }])
}

export const updateCartQuantity = (productId, quantity, selectedColor = '') => {
  const cart = getCart()
  if (quantity < 1) return saveCart(cart.filter((item) => !isSameCartItem(item, productId, selectedColor)))
  return saveCart(cart.map((item) => isSameCartItem(item, productId, selectedColor) ? { ...item, quantity: Math.min(100, quantity) } : item))
}

export const removeFromCart = (productId, selectedColor = '') => saveCart(getCart().filter((item) => !isSameCartItem(item, productId, selectedColor)))
export const clearCart = () => saveCart([])
