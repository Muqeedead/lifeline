/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F7FB",
        mist: "#EEF2FF",
        ink: "#121826",

        // accents
        accent: "#6D5EF4",   // premium purple
        blush: "#FF5FA2",
        mint: "#DFF7EA",
        sky: "#DDEEFF",
        lilac: "#EDE3FF",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(17, 24, 39, 0.08)",
        lift: "0 20px 50px rgba(17, 24, 39, 0.14)",
      },
    },
  },
  plugins: [],
};
