/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/index.html"],
  theme: {
    extend: {
      colors: {
        "primary-soft-pink": "#FFEDED",
        "secondary-bright-blue": "#7BDFF2",
      },
      spacing: {
        128: "32rem",
      },
    },
  },
  plugins: [],
};
