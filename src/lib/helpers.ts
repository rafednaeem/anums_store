export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`
}

export function calculateShipping(subtotal: number, freeThreshold: number, defaultRate: number): number {
  return subtotal >= freeThreshold ? 0 : defaultRate
}

export function calculateOrderTotals(
  items: { price: number; quantity: number }[],
  freeThreshold: number = 10000,
  defaultRate: number = 500
) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = calculateShipping(subtotal, freeThreshold, defaultRate)
  return { subtotal, shipping, total: subtotal + shipping }
}
