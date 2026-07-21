import type { Metadata } from "next"
import { getPageContent } from "@/lib/cms"
import OurStoryContent from "./OurStoryContent"

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Preserving the dying arts of traditional Pakistani craftsmanship while elevating them for the modern global stage.",
}

export default async function OurStoryPage() {
  const content = await getPageContent("our-story")
  return <OurStoryContent content={content} />
}
