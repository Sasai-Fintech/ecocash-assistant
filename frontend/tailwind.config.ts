import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A7CFF",
        secondary: "#0E1F33",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#111827",
            a: {
              color: "#0A7CFF",
              textDecoration: "none",
              "&:hover": {
                color: "#0860d6",
                textDecoration: "underline",
              },
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            code: {
              backgroundColor: "#f3f4f6",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
              fontWeight: "500",
            },
            pre: {
              backgroundColor: "#1f2937",
              color: "#f9fafb",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
