/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["-apple-system", "SF Pro Display", "Helvetica Neue", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "rise": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "spin": {
          to: { transform: "rotate(360deg)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
        "check-bounce": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.25)" },
          "50%": { transform: "scale(0.9)" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-down": {
          from: { opacity: "0", maxHeight: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", maxHeight: "800px", transform: "translateY(0)" },
        },
        "confetti": {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "50%": { transform: "scale(1.2) rotate(180deg)", opacity: "1" },
          "100%": { transform: "scale(0) rotate(360deg)", opacity: "0" },
        },
        "celebrate": {
          "0%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.05)" },
          "30%": { transform: "scale(0.97)" },
          "45%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        "step-done": {
          "0%": { opacity: "0.5", transform: "translateX(-4px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "rise": "rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "rise-fast": "rise 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        "spin-slow": "spin 0.7s linear infinite",
        "pulse-dot": "pulse-dot 2.5s ease infinite",
        "check-bounce": "check-bounce 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "confetti": "confetti 0.6s ease-out both",
        "celebrate": "celebrate 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "step-done": "step-done 0.3s ease both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
