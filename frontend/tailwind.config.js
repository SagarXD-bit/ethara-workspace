/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        mist: "#dbeafe",
        ember: "#f97316",
        skyline: "#38bdf8",
        pine: "#14b8a6"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(14, 165, 233, 0.18)"
      }
    }
  },
  plugins: []
};
