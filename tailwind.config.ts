import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ethereal: {
          mint:     "#7EC8B8",
          blush:    "#E8A89C",
          lavender: "#9B9AC8",
          silver:   "#B8B8B8",
          dark:     "#1A1A1A",
          cream:    "#F7F4F0",
          maroon:   "#7A1F1F",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ["var(--font-cormorant)", "Georgia", "serif"],
        body:    ["var(--font-geist-sans)", "sans-serif"],
        mono:    ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        "star-pattern": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cg transform='translate(22,22)'%3E%3Cpath d='M0,-7 L1.8,-1.8 L7,0 L1.8,1.8 L0,7 L-1.8,1.8 L-7,0 L-1.8,-1.8 Z' fill='none' stroke='%23C8C2BA' stroke-width='0.7'/%3E%3C/g%3E%3C/svg%3E\")",
        "dot-pattern": "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
