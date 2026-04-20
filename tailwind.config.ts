import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF2D78",
          dark: "#E0195F",
          light: "#FF6BA8",
        },
        surface: "#FFF5F8",
        border: "#FFD6E7",
        text: {
          DEFAULT: "#3C2233",
          muted: "#A07090",
        },
        success: "#09825D",
        error: "#DF1B41",
        highlight: "#FF9EC4",
        dark: "#1A0A14",
      },
      fontFamily: {
        sans: ["Inter", "Hiragino Sans", "Yu Gothic", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 5px rgba(255,45,120,.08), 0 1px 2px rgba(0,0,0,.06)",
        "card-hover": "0 7px 14px rgba(255,45,120,.15), 0 3px 6px rgba(0,0,0,.08)",
        btn: "0 4px 6px rgba(255,45,120,.25), 0 1px 3px rgba(0,0,0,.08)",
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
