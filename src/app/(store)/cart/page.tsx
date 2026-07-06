import type { Metadata } from "next"
import CartContent from "@/components/store/CartContent"

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review items in your shopping cart at Anums Store.",
}

export default function CartPage() {
  return <CartContent />
}
