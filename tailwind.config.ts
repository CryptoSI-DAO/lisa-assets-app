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
        background: "#111111",
        foreground: "#ffffff",
        accent: {
          DEFAULT: "#e7f900",
          dark: "#c9d800",
        },
        surface: {
          DEFAULT: "#1a1a1a",
          light: "#222222",
          lighter: "#2a2a2a",
        },
        muted: "#888888",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
