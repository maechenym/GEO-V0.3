import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Shadcn/ui colors (保留原有配置)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#13458c", // 品牌主色
          foreground: "hsl(var(--primary-foreground))",
          light: "#426aa3",
          dark: "#0f3870",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // OpenAI 风格 Design Tokens
        // 品牌色 - 专业配色方案
        // 100%: #13458c - 深蓝色（主色）
        // 60%:  #426aa3 - 中等偏深的蓝色
        // 50%:  #718fba - 中等蓝色
        // 40%:  #a1b5d1 - 中等偏浅的蓝色
        // 20%:  #d0dae8 - 最浅的蓝色/浅灰蓝色
        brand: {
          DEFAULT: "#13458c", // 100% - 深蓝色（主色）
          50: "#d0dae8",      // 20% - 最浅的蓝色/浅灰蓝色
          100: "#a1b5d1",     // 40% - 中等偏浅的蓝色
          200: "#718fba",     // 50% - 中等蓝色
          300: "#426aa3",     // 60% - 中等偏深的蓝色
          400: "#2d5a96",     // 70% - 中深蓝色（插值）
          500: "#1f4f89",     // 80% - 深蓝色（插值）
          600: "#13458c",     // 100% - 深蓝色（主色）
          700: "#0f3870",     // 更深变体
          800: "#0b2b54",     // 更深变体
          900: "#071e38",     // 最深变体
        },
        ink: {
          900: "#111827",
          700: "#374151",
          600: "#4B5563",
          500: "#6B7280",
          400: "#9CA3AF",
          300: "#D1D5DB",
          200: "#E5E7EB",
          100: "#F3F4F6",
          50: "#F9FAFB",
        },
        good: "#16A34A",
        bad: "#DC2626",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans CJK SC",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
        xs: ["12px", { lineHeight: "18px" }],
        sm: ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "22px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        // 保留 shadcn/ui 的 radius
        DEFAULT: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(17,24,39,0.04)",
      },
      spacing: {
        pageX: "40px",
        pageY: "32px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

