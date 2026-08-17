import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Storefront palette (from Storefront.dc.html) */
        shell: "#E8EBF0", // outer page background
        canvas: "#F9FAFB", // inner store surface
        ink: "#020C5A", // primary text / dark buttons
        muted: "#6B7280", // secondary text
        line: "#EEF0F3", // card hairline border
        brand: {
          DEFAULT: "#020C5A", // main brand navy
          dark: "#020C5A", // deeper shade (gradient start / hover)
        },
        good: "#16A34A", // "open now" green
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "-apple-system", "system-ui", "sans-serif"],
      },
      borderRadius: {
        brand: "10px", // unified corner radius across the app
      },
      backgroundImage: {
        // Primary brand gradient for buttons + active category pills.
        "brand-grad": "linear-gradient(135deg, #020C5A 20%, #020C5A 100%)",
      },
      maxWidth: {
        fab: "560px", // floating contact bar
      },
      padding: {
        gutter: "max(1rem, 4vw)", // fluid full-width page side gutter
      },
      boxShadow: {
        logo: "0 4px 12px rgba(15,23,42,0.08)",
        card: "0 1px 2px rgba(15,23,42,0.04)",
        cardHover: "0 16px 32px rgba(15,23,42,0.12)",
        fab: "0 14px 44px rgba(15,23,42,0.22)",
        cta: "0 8px 20px rgba(2,12,90,0.35)", // header chat button
        ctaFab: "0 6px 18px rgba(2,12,90,0.42)", // FAB contact button
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(22,163,74,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(22,163,74,0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
