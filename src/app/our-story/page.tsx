
export const metadata = {
  title: "Our Story - Anums Store",
  description: "Learn about the heritage and craftsmanship behind Anums Store Lahore.",
};

export default function OurStoryPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-heading text-ethereal-lavender mb-6">Our Story</h1>
        <div className="w-24 h-1 bg-ethereal-blush mx-auto"></div>
      </div>

      <div className="space-y-12 font-body text-lg text-foreground/80 leading-relaxed">
        <p>
          Born in the heart of Lahore, <strong>Anums Store</strong> is a celebration of Pakistan&apos;s vibrant cultural heritage. 
          We believe that traditional aesthetics, like the iconic and kaleidoscopic Truck Art, deserve a place in modern, everyday fashion.
        </p>

        <div className="aspect-video bg-gray-200 w-full relative border-4 border-ethereal-silver flex items-center justify-center text-gray-500">
           Story Video / Image Placeholder
        </div>

        <p>
          Our journey began with a simple idea: to create ready-to-wear and bridal collections that don&apos;t just look beautiful, 
          but tell a story of craftsmanship. Every piece in our collection is a labor of love, designed to empower and 
          inspire the modern Pakistani woman.
        </p>

        <p>
          From the delicate weaves of our organza wraps to the bold, unapologetic hues of our summer kurtas, we blend 
          heritage with contemporary silhouettes. Thank you for being a part of our colorful journey.
        </p>
      </div>
    </div>
  );
}
