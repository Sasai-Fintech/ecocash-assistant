import type { Metadata } from "next";

import "@copilotkit/react-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecocash AI Relationship Manager",
  description: "Conversational assistant powered by CopilotKit + Agno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
