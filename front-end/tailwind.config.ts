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
        primary: {
          orange: "#FF8C00",
          green: "#00FF88",
          success: "#4CAF50",
        },
        dark: {
          100: "#1a1a1a",
          200: "#2a2a2a",
        },
      },
      fontFamily: {
        game: ["Inter", "sans-serif"],
        jetbrains: ["JetBrains Mono", "monospace"],
        bricolage: ["Bricolage Grotesque", "sans-serif"],
      },
      animation: {
        "bounce-in": "bounceIn 0.6s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        confetti: "confetti 2s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
