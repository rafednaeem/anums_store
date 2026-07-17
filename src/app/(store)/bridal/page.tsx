import type { Metadata } from "next"
import BridalContent from "./BridalContent"

export const metadata: Metadata = {
  title: "Bridal Collection",
  description:
    "Discover timeless bridal couture — handcrafted heritage ensembles blending centuries-old artistry with modern elegance.",
}

export default function BridalPage() {
  return <BridalContent />
}
