import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";
import { AboutContent, aboutMeta } from "@/content/about";

export const metadata: Metadata = {
  title: aboutMeta.title,
  description: aboutMeta.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <DocPage title={aboutMeta.title}>
      <AboutContent />
    </DocPage>
  );
}
