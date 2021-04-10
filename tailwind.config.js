module.exports = {
  purge: ['./src/**/*.html','./src/**/*.md', './src/**/*.njk'],
  theme: {
    container: {
      center: true,
    },
    extend: {},
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
}
