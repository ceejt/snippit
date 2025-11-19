/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        "soft-pink": "#FFEDED",
        "upload-blue": "#007AFF",
      },
      spacing: {
        128: "32rem",
      },
    },
  },
  plugins: [],
};
