import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";
import { TermsContent, termsMeta } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: termsMeta.title,
  description: termsMeta.description,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <DocPage title={termsMeta.title} updated={termsMeta.updated} legal>
      <TermsContent />
    </DocPage>
  );
}
