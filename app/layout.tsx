import type { Metadata } from "next";
import { Chrome } from "@/components/Chrome";
import { siteName } from "@/lib/site";
import "./globals.css";

export function generateMetadata(): Metadata {
  const name = siteName();
  return {
    title: name,
    description: `${name} publishes the authoritative ways to reach a person, resolved from a certrelay mesh and anchored on Bitcoin.`,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
