// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {
      theme: {
        extend: {
          keyframes: {
            fadeInUp: {
              "0%": { opacity: "0", transform: "translateY(6px)" },
              "100%": { opacity: "1", transform: "translateY(0)" },
            },
          },
          animation: {
            fadeInUp: "fadeInUp .35s ease-out both",
          },
          colors: {
            brand: "#7c3aed",
          },
        },
      },
    },
  },
};

export default config;
