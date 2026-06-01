import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Anums Store",
  description: "Our policies on data collection, storage, and sharing for Anums Store Pakistan.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-5xl font-heading text-ethereal-lavender mb-8">Privacy Policy</h1>
      <div className="w-24 h-1 bg-ethereal-blush mb-12"></div>
      
      <div className="bg-white p-8 border-t-8 border-ethereal-lavender shadow-lg space-y-8 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-2xl font-heading text-ethereal-lavender mb-4">Introduction</h2>
          <p>
            Welcome to Anums Store. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our 
            website and tell you about your privacy rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading text-ethereal-lavender mb-4">The Data We Collect</h2>
          <p>
            We collect personal information that you provide to us, including your name, shipping address, 
            phone number, and payment details during the checkout process. We also collect automated 
            technical data via cookies and Google Analytics.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading text-ethereal-lavender mb-4">How We Use Your Data</h2>
          <p>
            Your data is used strictly for processing orders, managing your account, and providing customer support. 
            We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading text-ethereal-lavender mb-4">Third-Party Sharing</h2>
          <p>
            We share your information with trusted third-party service providers to facilitate your transactions:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li><strong>Safepay:</strong> For secure credit/debit card and mobile wallet processing.</li>
            <li><strong>Cashmaal:</strong> For digital wallet payments.</li>
            <li><strong>Courier Partners:</strong> For the delivery of your orders across Pakistan.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-heading text-ethereal-lavender mb-4">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at:
            <br />
            <a href="mailto:hello@anumsstore.pk" className="text-ethereal-blush font-bold underline">hello@anumsstore.pk</a>
          </p>
        </section>
      </div>
    </div>
  );
}
