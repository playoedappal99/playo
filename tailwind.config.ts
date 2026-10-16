import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          navy: "#0D1B2A",
          navyHover: "#16283C",
          orange: "#FF9800",
          orangeHover: "#F57C00",
          yellow: "#FFE600",
          light: "#F5F7FA",
          green: "#16A34A",
          whatsapp: "#25D366",
        },
      },
      fontFamily: {
        heading: ["'Outfit'", "'Urbanist'", "system-ui", "sans-serif"],
        urbanist: ["'Urbanist'", "system-ui", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
