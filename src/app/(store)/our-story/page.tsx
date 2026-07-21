import type { Metadata } from "next"
import OurStoryContent from "./OurStoryContent"

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Preserving the dying arts of traditional Pakistani craftsmanship while elevating them for the modern global stage.",
}

export default function OurStoryPage() {
  return <OurStoryContent />
}
