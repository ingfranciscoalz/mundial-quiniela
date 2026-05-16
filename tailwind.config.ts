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
        geo: {
          DEFAULT: "#C74A2A",
          light: "#D96040",
          dark: "#A33A1E",
          bg: "#FDF4F1",
        },
        arg: {
          blue: "#74ACDF",
          light: "#EBF4FB",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
