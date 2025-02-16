/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        play: ['"Play"', "serif"],
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".play-regular": {
          fontFamily: '"Play", serif',
          fontWeight: "400",
          fontStyle: "normal",
        },
        ".play-bold": {
          fontFamily: '"Play", serif',
          fontWeight: "700",
          fontStyle: "normal",
        },
        ".silkscreen-regular": {
          fontFamily: '"Silkscreen", serif',
          fontWeight: "400",
          fontStyle: "normal",
        },

        ".silkscreen-bold": {
          fontFamily: '"Silkscreen", serif',
          fontWeight: "700",
          fontStyle: "normal",
        },
      });
    },
  ],
};
