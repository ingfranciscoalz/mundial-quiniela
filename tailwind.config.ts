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
        argentina: {
          blue: "#74ACDF",
          sky: "#F6F6F6",
          gold: "#F9A602",
        },
      },
    },
  },
  plugins: [],
};
export default config;
