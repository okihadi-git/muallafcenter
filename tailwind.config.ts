import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: { 50: "#eff7f3", 100: "#dcece4", 600: "#26705b", 700: "#1b5948", 800: "#164638", 900: "#10382e" },
        sand: { 100: "#f8f4eb", 300: "#e8d8b5", 500: "#c49b4b" }
      },
      fontFamily: { quran: ["var(--font-quran)", "Noto Naskh Arabic", "serif"] },
      boxShadow: { soft: "0 10px 30px rgba(18, 54, 43, .07)" }
    }
  },
  plugins: []
};
export default config;