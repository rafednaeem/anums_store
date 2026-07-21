import type { Metadata } from "next"
import { getPageContent } from "@/lib/cms"
import BridalContent from "./BridalContent"

export const metadata: Metadata = {
  title: "Bridal Collection",
  description:
    "Discover timeless bridal couture — handcrafted heritage ensembles blending centuries-old artistry with modern elegance.",
}

export default async function BridalPage() {
  const content = await getPageContent("bridal")
  return <BridalContent content={content} />
}
