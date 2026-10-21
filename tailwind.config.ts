import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-canvas)",
        foreground: "var(--color-foreground)",
        card: {
          DEFAULT: "var(--color-panel)",
          foreground: "var(--color-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-panel)",
          foreground: "var(--color-foreground)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-canvas)",
        },
        secondary: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-secondary)",
        },
        accent: {
          DEFAULT: "var(--color-text-accent)",
          foreground: "var(--color-canvas)",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "var(--color-foreground)",
        },
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-primary)",
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        panel: "var(--color-panel)",
        line: "var(--color-border)",
        ink: "var(--color-foreground)",
        "accent-strong": "var(--color-primary-hover)",
        danger: "var(--color-danger)",
      },
      borderRadius: {
        kurio: "var(--radius)",
      },
      boxShadow: {
        panel: "0 18px 48px rgba(0, 0, 0, 0.24)",
      },
      fontFamily: {
        display: ["Roboto Mono", "ui-monospace", "monospace"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;