import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BRAND } from "../config/brand";

export const metadata: Metadata = {
  title: BRAND.name,
  // The app is behind sign-in once it exists; search engines never index it.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
