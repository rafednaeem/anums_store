INSERT INTO page_content (page_slug, section_key, content_key, content_value, content_type, sort_order)
VALUES
  -- HOME: hero
  ('home', 'hero', 'eyebrow', 'New Season', 'text', 1),
  ('home', 'hero', 'title', 'Curated Pakistani Fashion', 'text', 2),
  ('home', 'hero', 'description', 'Discover collections that blend traditional artistry with modern silhouettes — crafted for the contemporary woman.', 'text', 3),
  ('home', 'hero', 'cta_text', 'Shop Collection', 'text', 4),
  ('home', 'hero', 'cta_link', '/shop', 'text', 5),

  -- HOME: marquee
  ('home', 'marquee', 'items', '["Free Shipping on Orders Over Rs. 5,000", "New Bridal Collection Now Available", "Handcrafted with Love"]', 'json', 1),

  -- HOME: featured_products
  ('home', 'featured_products', 'title', 'Featured', 'text', 1),
  ('home', 'featured_products', 'description', 'Handpicked favourites from our latest collections.', 'text', 2),
  ('home', 'featured_products', 'empty_message', 'Products coming soon. Check back shortly.', 'text', 3),

  -- HOME: categories
  ('home', 'categories', 'section_label', 'Curated Portfolios', 'text', 1),
  ('home', 'categories', 'title', 'Explore Our World', 'text', 2),

  -- HOME: category_1
  ('home', 'category_1', 'title', 'Ready-to-Wear', 'text', 1),
  ('home', 'category_1', 'description', 'Everyday elegance redefined.', 'text', 2),
  ('home', 'category_1', 'cta_text', 'Discover Now', 'text', 3),
  ('home', 'category_1', 'image_url', '/home/category-rtw.jpg', 'image', 4),
  ('home', 'category_1', 'image_alt', 'Woman in ready-to-wear linen ensemble in heritage courtyard', 'text', 5),
  ('home', 'category_1', 'link', '/shop', 'text', 6),

  -- HOME: category_2
  ('home', 'category_2', 'title', 'Bridal', 'text', 1),
  ('home', 'category_2', 'cta_text', 'Exquisite Craft', 'text', 2),
  ('home', 'category_2', 'image_url', '/home/category-bridal.jpg', 'image', 3),
  ('home', 'category_2', 'image_alt', 'Bridal ensemble with gold filigree on crimson silk', 'text', 4),
  ('home', 'category_2', 'link', '/bridal', 'text', 5),

  -- HOME: category_3
  ('home', 'category_3', 'title', 'Accessories', 'text', 1),
  ('home', 'category_3', 'cta_text', 'The Finishing Touch', 'text', 2),
  ('home', 'category_3', 'image_url', '/home/category-accessories.jpg', 'image', 3),
  ('home', 'category_3', 'image_alt', 'Velvet clutch and delicate gold jewelry on stone surface', 'text', 4),
  ('home', 'category_3', 'link', '/shop', 'text', 5),

  -- HOME: brand_ethos
  ('home', 'brand_ethos', 'quote', 'Our story is woven into every stitch, bridging generations of artistry with the spirit of today.', 'text', 1),
  ('home', 'brand_ethos', 'description', 'Founded in the heart of Pakistan''s rich textile heritage, Anums Store is dedicated to preserving the ancient techniques of hand-weaving, block printing, and needlework. By collaborating with local artisans, we ensure that every garment tells a story of skill, patience, and unparalleled beauty.', 'text', 2),
  ('home', 'brand_ethos', 'cta_text', 'Our Heritage', 'text', 3),
  ('home', 'brand_ethos', 'cta_link', '/our-story', 'text', 4),

  -- HEADER: nav
  ('header', 'nav', 'link_1_label', 'Shop', 'text', 1),
  ('header', 'nav', 'link_1_href', '/shop', 'text', 2),
  ('header', 'nav', 'link_2_label', 'Bridal', 'text', 3),
  ('header', 'nav', 'link_2_href', '/bridal', 'text', 4),
  ('header', 'nav', 'link_3_label', 'Our Story', 'text', 5),
  ('header', 'nav', 'link_3_href', '/our-story', 'text', 6),

  -- FOOTER: brand
  ('footer', 'brand', 'description', 'Curating Pakistan''s finest artisanal heritage for the modern wardrobe.', 'text', 1),
  ('footer', 'brand', 'logo_url', '/logo.png', 'image', 2),

  -- FOOTER: quick_links
  ('footer', 'quick_links', 'heading', 'Quick Links', 'text', 1),
  ('footer', 'quick_links', 'link_1_label', 'Shop All', 'text', 2),
  ('footer', 'quick_links', 'link_1_href', '/shop', 'text', 3),
  ('footer', 'quick_links', 'link_2_label', 'Our Story', 'text', 4),
  ('footer', 'quick_links', 'link_2_href', '/our-story', 'text', 5),
  ('footer', 'quick_links', 'link_3_label', 'Contact Us', 'text', 6),
  ('footer', 'quick_links', 'link_3_href', '/contact', 'text', 7),

  -- FOOTER: assistance
  ('footer', 'assistance', 'heading', 'Assistance', 'text', 1),
  ('footer', 'assistance', 'link_1_label', 'Privacy Policy', 'text', 2),
  ('footer', 'assistance', 'link_1_href', '/privacy-policy', 'text', 3),
  ('footer', 'assistance', 'link_2_label', 'Shipping & Returns', 'text', 4),
  ('footer', 'assistance', 'link_2_href', '/shipping-returns', 'text', 5),

  -- FOOTER: bottom
  ('footer', 'bottom', 'copyright', 'All Rights Reserved.', 'text', 1),
  ('footer', 'bottom', 'location_1', 'Lahore', 'text', 2),
  ('footer', 'bottom', 'location_2', 'London', 'text', 3),
  ('footer', 'bottom', 'location_3', 'Dubai', 'text', 4),

  -- BRIDAL: hero
  ('bridal', 'hero', 'background_image', '/bridal/hero.jpg', 'image', 1),
  ('bridal', 'hero', 'subtitle', 'The Heritage Collection', 'text', 2),
  ('bridal', 'hero', 'title', 'Timeless Bridal', 'text', 3),
  ('bridal', 'hero', 'cta_text', 'Explore The Collection', 'text', 4),

  -- BRIDAL: stats
  ('bridal', 'stats', 'stat_1', '1,200 Artisanal Hours', 'text', 1),
  ('bridal', 'stats', 'stat_2', 'Pure Mulberry Silk', 'text', 2),

  -- BRIDAL: philosophy
  ('bridal', 'philosophy', 'label', 'Our Philosophy', 'text', 1),
  ('bridal', 'philosophy', 'title', 'A legacy woven in every thread, a story told in every stitch.', 'text', 2),
  ('bridal', 'philosophy', 'description', 'At Anums Store, we believe bridal couture is more than attire; it is an heirloom. Our artisans spend hundreds of hours hand-crafting each piece, reviving centuries-old embroidery techniques like Zardosi and Gota work to create garments that transcend generations.', 'text', 3),

  -- BRIDAL: masterpiece
  ('bridal', 'masterpiece', 'image_url', '/bridal/masterpiece.jpg', 'image', 1),
  ('bridal', 'masterpiece', 'image_alt', 'Detailed silver and pearl embroidery on deep crimson bridal gown', 'text', 2),
  ('bridal', 'masterpiece', 'label', 'The Crimson Muse', 'text', 3),
  ('bridal', 'masterpiece', 'title', 'Velvet Noir & Antique Silver', 'text', 4),
  ('bridal', 'masterpiece', 'description', 'Designed for the modern traditionalist, this ensemble features hand-crafted metallic threads and semi-precious stones embedded within deep silk velvet. A testament to the artistry of our master weavers.', 'text', 5),

  -- BRIDAL: bento_grid
  ('bridal', 'bento_grid', 'title', 'The Art of Detail', 'text', 1),
  ('bridal', 'bento_grid', 'subtitle', 'A closer look at our signature handicrafts', 'text', 2),
  ('bridal', 'bento_grid', 'item_1_image', '/bridal/celestial-veil.jpg', 'image', 3),
  ('bridal', 'bento_grid', 'item_1_alt', 'Bride walking through minimalist white marble hall with trailing dupatta', 'text', 4),
  ('bridal', 'bento_grid', 'item_1_label', 'The Celestial Veil', 'text', 5),
  ('bridal', 'bento_grid', 'item_2_image', '/bridal/master-craftsman.jpg', 'image', 6),
  ('bridal', 'bento_grid', 'item_2_alt', 'Artisan hands weaving gold threads into floral pattern on embroidery frame', 'text', 7),
  ('bridal', 'bento_grid', 'item_2_label', 'Master Craftsman at Work', 'text', 8),
  ('bridal', 'bento_grid', 'item_3_image', '/bridal/heritage-jewelry.jpg', 'image', 9),
  ('bridal', 'bento_grid', 'item_3_alt', 'Gold jhumkas and maang tikka on raw silk', 'text', 10),
  ('bridal', 'bento_grid', 'item_3_label', 'Heritage Jewelry', 'text', 11),
  ('bridal', 'bento_grid', 'item_4_image', '/bridal/bridal-details.jpg', 'image', 12),
  ('bridal', 'bento_grid', 'item_4_alt', 'Henna-patterned hands holding delicate lace handkerchief', 'text', 13),
  ('bridal', 'bento_grid', 'item_4_label', 'Bridal Details', 'text', 14),

  -- BRIDAL: consultation
  ('bridal', 'consultation', 'background_image', '/bridal/consultation-bg.jpg', 'image', 1),
  ('bridal', 'consultation', 'title', 'Begin Your Journey', 'text', 2),
  ('bridal', 'consultation', 'description', 'Every bride deserves a masterpiece. Schedule a private consultation with our lead designers to bring your vision to life.', 'text', 3),
  ('bridal', 'consultation', 'form_name_label', 'Full Name', 'text', 4),
  ('bridal', 'consultation', 'form_name_placeholder', 'ALIZA MALIK', 'text', 5),
  ('bridal', 'consultation', 'form_email_label', 'Email Address', 'text', 6),
  ('bridal', 'consultation', 'form_email_placeholder', 'ALIZA@EXAMPLE.COM', 'text', 7),
  ('bridal', 'consultation', 'submit_text', 'Book A Consultation', 'text', 8),

  -- OUR STORY: hero
  ('our-story', 'hero', 'label', 'Heritage & Modernity', 'text', 1),
  ('our-story', 'hero', 'title', 'Handcrafted with Love', 'text', 2),
  ('our-story', 'hero', 'description', 'Our journey began with a simple vision: to preserve the dying arts of traditional Pakistani craftsmanship while elevating them for the modern global stage.', 'text', 3),
  ('our-story', 'hero', 'subtext', 'Founded in Lahore, 2024.', 'text', 4),
  ('our-story', 'hero', 'image_url', '/our-story/hero.jpg', 'image', 5),
  ('our-story', 'hero', 'image_alt', 'Master craftsman''s hands embroidering gold threads on luxurious off-white silk', 'text', 6),
  ('our-story', 'hero', 'image_overlay', 'Master Craftsman at Work', 'text', 7),

  -- OUR STORY: artisans
  ('our-story', 'artisans', 'image_url', '/our-story/artisan-blocks.jpg', 'image', 1),
  ('our-story', 'artisans', 'image_alt', 'Wooden blocks for block printing stained with indigo and ochre dyes', 'text', 2),
  ('our-story', 'artisans', 'title', 'Traditional Artistry', 'text', 3),
  ('our-story', 'artisans', 'paragraph_1', 'Every garment at Anums Store tells a story of patience. We work exclusively with fourth-generation artisans who have mastered the intricate techniques of hand-loom weaving and block printing.', 'text', 4),
  ('our-story', 'artisans', 'paragraph_2', 'Unlike mass-produced fashion, our pieces are born from the rhythmic sound of the loom and the careful placement of the block. This deliberate slowness is our protest against the transience of modern trends.', 'text', 5),

  -- OUR STORY: quote
  ('our-story', 'quote', 'text', 'We don''t just create clothes; we preserve a legacy of hands that have spent lifetimes perfecting the art of beauty.', 'text', 1),
  ('our-story', 'quote', 'attribution', '— Anum Rashid, Founder', 'text', 2),

  -- OUR STORY: values
  ('our-story', 'values', 'value_1_title', 'Ethical Sourcing', 'text', 1),
  ('our-story', 'values', 'value_1_description', 'We ensure fair living wages and safe working environments for all our partner artisans, fostering community growth and dignity.', 'text', 2),
  ('our-story', 'values', 'value_2_title', 'Timeless Design', 'text', 3),
  ('our-story', 'values', 'value_2_description', 'Our aesthetic transcends seasons. We create investment pieces designed to be cherished and passed down through generations.', 'text', 4),
  ('our-story', 'values', 'value_3_title', 'Sustainable Future', 'text', 5),
  ('our-story', 'values', 'value_3_description', 'By prioritizing natural fibers and traditional low-impact methods, we minimize our ecological footprint on the planet.', 'text', 6),

  -- SHOP: hero
  ('shop', 'hero', 'title', 'The Collection', 'text', 1),
  ('shop', 'hero', 'description', 'Discover the intersection of heritage craftsmanship and modern silhouettes. From handcrafted bridals to contemporary ready-to-wear essentials.', 'text', 2),

  -- SHOP: empty_state
  ('shop', 'empty_state', 'title', 'No products found', 'text', 1),
  ('shop', 'empty_state', 'description', 'Try adjusting your search or filter criteria.', 'text', 2),

  -- CONTACT: hero
  ('contact', 'hero', 'image_url', '/contact/hero.jpg', 'image', 1),
  ('contact', 'hero', 'image_alt', 'Intricate ivory Pakistani bridal gown with hand-stitched silver embroidery', 'text', 2),
  ('contact', 'hero', 'title', 'Contact Us', 'text', 3),
  ('contact', 'hero', 'description', 'Have a question? We''d love to hear from you.', 'text', 4),

  -- CONTACT: form
  ('contact', 'form', 'heading', 'Send us a message', 'text', 1),
  ('contact', 'form', 'success_heading', 'Message sent!', 'text', 2),
  ('contact', 'form', 'success_text', 'Thank you for reaching out. We''ll get back to you as soon as possible.', 'text', 3),
  ('contact', 'form', 'success_button', 'Send another message', 'text', 4),
  ('contact', 'form', 'name_label', 'Name *', 'text', 5),
  ('contact', 'form', 'email_label', 'Email *', 'text', 6),
  ('contact', 'form', 'subject_label', 'Subject *', 'text', 7),
  ('contact', 'form', 'message_label', 'Message *', 'text', 8),
  ('contact', 'form', 'submit_text', 'Send Message', 'text', 9),
  ('contact', 'form', 'loading_text', 'Sending...', 'text', 10),

  -- CONTACT: info
  ('contact', 'info', 'heading', 'Get in touch', 'text', 1),
  ('contact', 'info', 'bottom_quote', 'Our artisans are dedicated to preserving the legacy of traditional craftsmanship. We look forward to assisting you with your inquiries.', 'text', 2),

  -- CONTACT: divider
  ('contact', 'divider', 'image_url', '/contact/divider.jpg', 'image', 1),
  ('contact', 'divider', 'image_alt', 'Skilled hands delicately embroidering cream-colored silk with silver thread and pearls', 'text', 2),

  -- SHIPPING & RETURNS: hero
  ('shipping-returns', 'hero', 'label', 'Policies', 'text', 1),
  ('shipping-returns', 'hero', 'title', 'Shipping & Returns', 'text', 2),

  -- SHIPPING & RETURNS: shipping
  ('shipping-returns', 'shipping', 'title', 'Shipping', 'text', 1),
  ('shipping-returns', 'shipping', 'description', 'We offer nationwide delivery across Pakistan via our trusted courier partners. All orders are carefully packaged in our signature branded boxes to ensure your pieces arrive in perfect condition.', 'text', 2),
  ('shipping-returns', 'shipping', 'timelines_title', 'Delivery Timelines', 'text', 3),
  ('shipping-returns', 'shipping', 'lahore', '2–3 business days', 'text', 4),
  ('shipping-returns', 'shipping', 'other_cities', '4–6 business days', 'text', 5),
  ('shipping-returns', 'shipping', 'remote_areas', '6–8 business days', 'text', 6),
  ('shipping-returns', 'shipping', 'processing_note', 'Orders placed before 2:00 PM PKT on business days are processed the same day. Orders placed after 2:00 PM or on weekends are processed the next business day.', 'text', 7),
  ('shipping-returns', 'shipping', 'free_shipping_note', 'Free shipping is available on all orders above Rs. 5,000. A flat shipping fee of Rs. 250 applies to orders below this threshold.', 'text', 8),

  -- SHIPPING & RETURNS: tracking
  ('shipping-returns', 'tracking', 'title', 'Order Tracking', 'text', 1),
  ('shipping-returns', 'tracking', 'description', 'Once your order has been dispatched, you will receive a confirmation email with a tracking number. You can track your order through our courier partner''s website or by contacting our team directly.', 'text', 2),

  -- SHIPPING & RETURNS: returns
  ('shipping-returns', 'returns', 'title', 'Returns & Exchanges', 'text', 1),
  ('shipping-returns', 'returns', 'description', 'We want you to be completely satisfied with your purchase. If for any reason you are not, we offer a straightforward return and exchange process.', 'text', 2),
  ('shipping-returns', 'returns', 'eligibility_title', 'Eligibility', 'text', 3),
  ('shipping-returns', 'returns', 'eligibility_1', 'Returns must be initiated within 7 days of delivery', 'text', 4),
  ('shipping-returns', 'returns', 'eligibility_2', 'Items must be unworn, unwashed, and in their original packaging with all tags attached', 'text', 5),
  ('shipping-returns', 'returns', 'eligibility_3', 'Sale items and custom orders are not eligible for returns', 'text', 6),
  ('shipping-returns', 'returns', 'eligibility_4', 'Items must not show any signs of wear, makeup stains, or perfume', 'text', 7),
  ('shipping-returns', 'returns', 'how_to_title', 'How to Initiate a Return', 'text', 8),
  ('shipping-returns', 'returns', 'step_1', 'Contact our team via email or WhatsApp with your order number', 'text', 9),
  ('shipping-returns', 'returns', 'step_2', 'Receive a return authorization and shipping instructions', 'text', 10),
  ('shipping-returns', 'returns', 'step_3', 'Pack the item securely in its original packaging', 'text', 11),
  ('shipping-returns', 'returns', 'step_4', 'Ship the item using the provided return label', 'text', 12),
  ('shipping-returns', 'returns', 'step_5', 'Receive your refund or exchange within 5–7 business days of inspection', 'text', 13),
  ('shipping-returns', 'returns', 'refund_note', 'Refunds are processed to the original payment method. Bank transfers may take 3–5 additional business days to reflect in your account.', 'text', 14),

  -- SHIPPING & RETURNS: damaged
  ('shipping-returns', 'damaged', 'title', 'Damaged or Defective Items', 'text', 1),
  ('shipping-returns', 'damaged', 'description', 'If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the damage. We will arrange a free return pickup and offer either a full refund or a replacement at no additional cost.', 'text', 2),

  -- SHIPPING & RETURNS: contact_note
  ('shipping-returns', 'contact_note', 'text', 'For any questions about shipping or returns, please reach out to us at info@anumsstore.pk or via WhatsApp.', 'text', 1),

  -- PRIVACY POLICY: hero
  ('privacy-policy', 'hero', 'label', 'Legal', 'text', 1),
  ('privacy-policy', 'hero', 'title', 'Privacy Policy', 'text', 2),
  ('privacy-policy', 'hero', 'last_updated', 'Last updated: January 2024', 'text', 3),

  -- PRIVACY POLICY: intro
  ('privacy-policy', 'intro', 'text', 'At Anums Store, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.', 'text', 1),

  -- PRIVACY POLICY: collect
  ('privacy-policy', 'collect', 'title', 'Information We Collect', 'text', 1),
  ('privacy-policy', 'collect', 'intro', 'We may collect the following types of information:', 'text', 2),
  ('privacy-policy', 'collect', 'personal', 'Personal Information: Name, email address, phone number, shipping address, and payment information when you place an order', 'text', 3),
  ('privacy-policy', 'collect', 'account', 'Account Information: Email and password when you create an account', 'text', 4),
  ('privacy-policy', 'collect', 'usage', 'Usage Data: Browser type, IP address, pages visited, and time spent on our website', 'text', 5),
  ('privacy-policy', 'collect', 'cookies', 'Cookies: Information stored on your device to improve your browsing experience', 'text', 6),

  -- PRIVACY POLICY: use
  ('privacy-policy', 'use', 'title', 'How We Use Your Information', 'text', 1),
  ('privacy-policy', 'use', 'intro', 'We use your information to:', 'text', 2),
  ('privacy-policy', 'use', 'items', '["Process and fulfill your orders", "Send order confirmations and shipping updates", "Respond to your customer service inquiries", "Improve our website and shopping experience", "Send promotional communications (only with your consent)", "Prevent fraud and ensure transaction security"]', 'json', 3),

  -- PRIVACY POLICY: sharing
  ('privacy-policy', 'sharing', 'title', 'Information Sharing', 'text', 1),
  ('privacy-policy', 'sharing', 'description', 'We do not sell or rent your personal information to third parties. We may share your information with:', 'text', 2),
  ('privacy-policy', 'sharing', 'courier', 'Courier Partners: To deliver your orders to the provided shipping address', 'text', 3),
  ('privacy-policy', 'sharing', 'payment', 'Payment Processors: To securely process your payments', 'text', 4),
  ('privacy-policy', 'sharing', 'legal', 'Legal Authorities: When required by law or to protect our legal rights', 'text', 5),

  -- PRIVACY POLICY: security
  ('privacy-policy', 'security', 'title', 'Data Security', 'text', 1),
  ('privacy-policy', 'security', 'description', 'We implement industry-standard security measures to protect your personal information, including encrypted data transmission (SSL), secure server infrastructure, and regular security audits. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.', 'text', 2),

  -- PRIVACY POLICY: rights
  ('privacy-policy', 'rights', 'title', 'Your Rights', 'text', 1),
  ('privacy-policy', 'rights', 'intro', 'You have the right to:', 'text', 2),
  ('privacy-policy', 'rights', 'items', '["Access the personal information we hold about you", "Request correction of inaccurate data", "Request deletion of your personal data", "Opt out of marketing communications at any time", "Withdraw consent for data processing"]', 'json', 3),

  -- PRIVACY POLICY: cookies_section
  ('privacy-policy', 'cookies_section', 'title', 'Cookies', 'text', 1),
  ('privacy-policy', 'cookies_section', 'description', 'Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us understand how you use our site and remember your preferences. You can control cookie settings through your browser preferences.', 'text', 2),

  -- PRIVACY POLICY: changes
  ('privacy-policy', 'changes', 'title', 'Changes to This Policy', 'text', 1),
  ('privacy-policy', 'changes', 'description', 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.', 'text', 2),

  -- PRIVACY POLICY: contact_section
  ('privacy-policy', 'contact_section', 'title', 'Contact Us', 'text', 1),
  ('privacy-policy', 'contact_section', 'description', 'If you have any questions about this Privacy Policy or how we handle your data, please contact us at info@anumsstore.pk.', 'text', 2),

  -- 404: content
  ('not-found', 'content', 'code', '404', 'text', 1),
  ('not-found', 'content', 'title', 'Page Not Found', 'text', 2),
  ('not-found', 'content', 'description', 'The page you''re looking for doesn''t exist or has been moved.', 'text', 3),
  ('not-found', 'content', 'cta_text', 'Back to Home', 'text', 4),

  -- PRODUCT DETAIL: trust_badges
  ('product-detail', 'trust_badges', 'badge_1_title', 'Free Shipping', 'text', 1),
  ('product-detail', 'trust_badges', 'badge_1_text', 'On orders over Rs. 10,000', 'text', 2),
  ('product-detail', 'trust_badges', 'badge_2_title', 'Easy Returns', 'text', 3),
  ('product-detail', 'trust_badges', 'badge_2_text', '7-day return policy', 'text', 4),
  ('product-detail', 'trust_badges', 'badge_3_title', 'Secure Payment', 'text', 5),
  ('product-detail', 'trust_badges', 'badge_3_text', '100% secure checkout', 'text', 6),

  -- PRODUCT DETAIL: reviews
  ('product-detail', 'reviews', 'title', 'Customer Reviews', 'text', 1),
  ('product-detail', 'reviews', 'empty_message', 'No reviews yet. Be the first to review this product!', 'text', 2),

  -- PRODUCT DETAIL: related
  ('product-detail', 'related', 'title', 'You May Also Like', 'text', 3),

  -- GLOBAL: seo
  ('global', 'seo', 'default_title', 'Anums Store | Pakistani Fashion & Bridal', 'text', 1),
  ('global', 'seo', 'title_template', '%s | Anums Store', 'text', 2),
  ('global', 'seo', 'description', 'Discover handcrafted products that blend tradition with modern elegance. Anums Store offers curated collections with timeless design and sustainable craftsmanship.', 'text', 3),
  ('global', 'seo', 'og_title', 'Anums Store | Handcrafted Elegance', 'text', 4),
  ('global', 'seo', 'og_description', 'Discover handcrafted products that blend tradition with modern elegance.', 'text', 5),
  ('global', 'seo', 'og_image', '/og-image.jpg', 'image', 6),
  ('global', 'seo', 'schema_description', 'Curated Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.', 'text', 7),

  -- GLOBAL: whatsapp
  ('global', 'whatsapp', 'message_template', 'Hi! I''m interested in shopping at Anums Store.', 'text', 1)

ON CONFLICT (page_slug, section_key, content_key) DO NOTHING;
