import { getPageContent } from "@/lib/cms"
import Header from "@/components/store/Header"
import Footer from "@/components/store/Footer"

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [headerContent, footerContent] = await Promise.all([
    getPageContent("header"),
    getPageContent("footer"),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header content={headerContent} />
      <main className="flex-1">{children}</main>
      <Footer content={footerContent} />
    </div>
  )
}
