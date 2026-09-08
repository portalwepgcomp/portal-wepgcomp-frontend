import type { Config } from "tailwindcss";

/**
 * Tailwind puro — Bootstrap removido; preflight e container ativos.
 */
const config: Config = {
  important: false,
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  corePlugins: {
    preflight: true,
    container: true,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#054b75",
          orange: "#ffa90f",
          accent: "#f17f0c",
          blue: {
            DEFAULT: "#0065a3",
            light: "#0094d4",
          },
          slate: "#5c7a9c",
          gold: "#f3b773",
        },
        primary: {
          DEFAULT: "#4a90e2",
          hover: "#357abd",
          light: "#e8f2fc",
        },
        background: "#f5f5f5",
        card: "#ffffff",
        foreground: "#3c4043",
        muted: {
          DEFAULT: "#5f6368",
          light: "#f1f3f4",
        },
        line: "#e8eaed",
        success: {
          DEFAULT: "#27ae60",
          light: "#d5f4e6",
        },
        error: {
          DEFAULT: "#e74c3c",
          light: "#fadbd8",
        },
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px rgba(0, 0, 0, 0.07)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        sans: ["Montserrat", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
      keyframes: {
        selectContentShow: {
          from: { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        selectContentHide: {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to: { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
        },
      },
      animation: {
        "select-content-show": "selectContentShow 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "select-content-hide": "selectContentHide 0.15s ease-in",
      },
    },
  },
  plugins: [],
};

export default config;
