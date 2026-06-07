/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FEF3E8",
          dark: "#F9E4CC",
        },
        brand: {
          DEFAULT: "#7C3AED",
          light: "#EDE9FE",
          dark: "#5B21B6",
        },
        coral: "#FF6B6B",
        mint: "#34D399",
        golden: "#F59E0B",
        sky: "#38BDF8",
        pink: "#F472B6",
        ink: "#2D1B00",
        muted: "#A08060",
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "3xl": "24px",
        "2xl": "16px",
      },
      boxShadow: {
        lift: "4px 4px 0px 0px #F9E4CC",
        "lift-lg": "6px 6px 0px 0px #E8D0B0",
        "btn-primary": "3px 3px 0px 0px #5B21B6",
        "btn-coral": "3px 3px 0px 0px #CC4444",
        "btn-mint": "3px 3px 0px 0px #059669",
        "btn-golden": "3px 3px 0px 0px #B45309",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        wiggle: "wiggle 1s ease-in-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
      },
    },
  },
  plugins: [],
};
