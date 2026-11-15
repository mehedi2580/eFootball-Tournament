import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "#3730C9",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        gold: {
          DEFAULT: "#EDBB00",
          light: "#FBBF24",
          soft: "#FEF9E7",
        },
        navy: {
          DEFAULT: "#0B1020",
          deep: "#001432",
          soft: "#121829",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "1.25rem",
        md: "0.875rem",
        sm: "0.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.05)",
        "card-hover": "0 18px 40px rgba(17, 24, 39, 0.10)",
        primary: "0 10px 22px rgba(77, 70, 232, 0.28)",
        pill: "0 10px 26px rgba(2, 6, 23, 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
