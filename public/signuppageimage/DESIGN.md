---
name: Heritage Modernity
colors:
  surface: '#faf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#faf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ef'
  surface-container: '#efeee9'
  surface-container-high: '#e9e8e3'
  surface-container-highest: '#e3e3de'
  on-surface: '#1b1c19'
  on-surface-variant: '#444748'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#af2b3e'
  on-secondary: '#ffffff'
  secondary-container: '#fd6673'
  on-secondary-container: '#680018'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1b1a'
  on-tertiary-container: '#868381'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#ffdada'
  secondary-fixed-dim: '#ffb3b5'
  on-secondary-fixed: '#40000b'
  on-secondary-fixed-variant: '#8e0f28'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c3'
  on-tertiary-fixed: '#1d1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#faf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e3e3de'
  surface-white: '#FFFFFF'
  subtle-gray: '#E5E5E5'
  heritage-accent: '#800020'
typography:
  display-lg:
    fontFamily: ebGaramond
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: ebGaramond
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: ebGaramond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-md:
    fontFamily: ebGaramond
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
  body-lg:
    fontFamily: inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  button:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
spacing:
  container-max: 1440px
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 20px
  gutter: 24px
  section-gap: 120px
---

## Brand & Style

This design system is built upon the philosophy of "Heritage Modernity," bridging the gap between traditional Pakistani textile craftsmanship and contemporary high-fashion aesthetics. The brand personality is refined, quiet, and sophisticated, prioritizing clarity and space over decorative excess. 

The visual style follows a **Minimalist** and **Editorial** approach. It treats the interface as a digital gallery where high-quality photography is the focal point. By utilizing a restrained color palette and architectural typography, the design system evokes a sense of permanence and luxury. The emotional response should be one of calm exclusivity—inviting the user into a curated space where every detail is intentional.

## Colors

The palette is rooted in a "Warm Minimal" spectrum. The primary background is the off-white `#FDFCF7`, which provides a softer, more organic feel than pure white, reminiscent of high-end parchment or unbleached silk. 

- **Primary Black (#111111):** Used for typography, iconography, and core structural elements to provide a grounded, high-contrast anchor.
- **Secondary Heritage Red (#800020):** A deep burgundy reserved for moments of emphasis, such as "Limited Edition" tags, active states, or subtle call-to-action highlights, nodding to traditional Pakistani bridal and festive hues.
- **Neutral Off-White (#FDFCF7):** The canvas for the entire experience.
- **Pure White (#FFFFFF):** Used sparingly for image containers or card backgrounds to create "light-on-light" depth tiers.

## Typography

The typographic strategy relies on a classic serif-sans pairing. **EB Garamond** is the voice of the brand, used for large-scale headlines and editorial statements. Its historical weight provides the "Heritage" aspect of the system. **Inter** serves as the functional workhorse, ensuring maximum legibility for product details, navigation, and commerce-critical information.

- Use **display-lg** for hero sections and collection titles.
- Use **label-caps** for categories, breadcrumbs, and small descriptors to maintain a structured, clean look.
- Optical sizing is critical; ensure the serif fonts have generous line height to prevent the "tight" look of digital-first serifs.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop to maintain the integrity of editorial compositions, shifting to a **Fluid Grid** for mobile. The layout is characterized by "Aggressive Whitespace"—using large gaps between sections (`section-gap`) to allow the photography to breathe.

- **Desktop (1440px+):** 12-column grid with wide 64px outer margins. Elements should frequently span the full width or be offset to create asymmetrical, dynamic compositions.
- **Mobile:** 4-column grid with 20px margins. Content should be stacked vertically, prioritizing a "single-column luxury feed" look.
- **Rhythm:** All spacing should be multiples of 8px.

## Elevation & Depth

To maintain a minimalist aesthetic, depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than traditional shadows.

- **Surface Levels:** The base layer is the Neutral Off-white. Floating elements or "cards" use Pure White surfaces with a very thin (0.5px or 1px) Primary Black border at low opacity (10-15%).
- **Shadows:** Avoid drop shadows on cards and buttons. If depth is absolutely necessary (e.g., a modal), use a high-spread, low-opacity (5%) neutral shadow that feels like ambient light rather than a digital effect.
- **Hairlines:** Use horizontal and vertical hairlines (1px) to separate navigation and sections, mimicking the layout of a physical broadsheet or luxury lookbook.

## Shapes

The shape language is strictly **Sharp (0)**. 

Rectilinear forms convey a sense of architectural precision and formality appropriate for luxury fashion. All buttons, image containers, input fields, and UI panels must have 0px corner radii. This creates a crisp, bespoke feeling that distinguishes the product from mass-market, rounded SaaS interfaces.

## Components

- **Buttons:** 
  - *Primary:* Solid Black background with White text, uppercase, no rounding. 
  - *Secondary:* Transparent background with a 1px Black border. 
  - *Hover states:* Subtle opacity shift (90%) or a background fill for secondary buttons.
- **Input Fields:** 
  - Use a "Minimal Underline" style—only a bottom border (1px Black). Labels should use the `label-caps` style positioned above the line.
- **Cards (Product):** 
  - Borderless by default. The image should fill the container. Text (Title and Price) should be left-aligned underneath in `body-md` and `body-lg`.
- **Chips/Tags:** 
  - Small, rectangular boxes with `label-caps` text. Use the Secondary Heritage Red for "New" or "Sale" tags to draw immediate eye movement without breaking the layout.
- **Navigation:** 
  - A persistent, high-transparency blur (Glassmorphism) over the Off-white background, using a thin bottom hairline for separation. Use a centered logo with left-aligned navigation links.