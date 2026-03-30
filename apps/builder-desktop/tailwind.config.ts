import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
      },
      borderRadius: {
        xl: "1.25rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 24px 64px rgba(15, 23, 42, 0.18)",
        panel: "0 18px 44px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "mesh-light": "radial-gradient(circle at top left, rgba(22, 163, 74, 0.18), transparent 38%), radial-gradient(circle at top right, rgba(14, 165, 233, 0.15), transparent 28%), linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(247, 249, 252, 0.96))",
        "mesh-dark": "radial-gradient(circle at top left, rgba(34, 197, 94, 0.18), transparent 34%), radial-gradient(circle at top right, rgba(56, 189, 248, 0.14), transparent 24%), linear-gradient(180deg, rgba(4, 11, 24, 0.94), rgba(8, 15, 27, 0.98))",
      },
    },
  },
  plugins: [],
};

export default config;
