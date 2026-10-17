import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2E5E3A", foreground: "#FFFFFF", deep: "#1E2A1F", soft: "#E4EDDF" },
        wheat: { DEFAULT: "#E3B04B", foreground: "#1E2A1F", soft: "#FFF1D6" },
        background: { DEFAULT: "#F5F1E6", paper: "#FBF9F2", dark: "#0F1512" },
        border: { DEFAULT: "#E2DCCB", strong: "#C9C1A9", dark: "#33423A" },
        muted: { DEFAULT: "#465043", foreground: "#9AA89E", soft: "#EFEBDF" },
        forest: { DEFAULT: "#121A15", light: "#B9CFB0", mid: "#3E7550" },
        danger: { DEFAULT: "#A33A2B", soft: "#F6E1DD" },
        info: { DEFAULT: "#2B5C8A", soft: "#E0EAF4" }
      },
      // Slightly larger small sizes so helper text stays readable.
      fontSize: {
        // With the 19px root: xs ≈ 16px, sm ≈ 18px
        xs: ["0.8421rem", { lineHeight: "1.25rem" }],
        sm: ["0.9474rem", { lineHeight: "1.4rem" }]
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-fraunces)", "serif"]
      },
      boxShadow: {
        panel: "0 18px 48px rgba(30, 42, 31, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;