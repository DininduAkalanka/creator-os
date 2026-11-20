import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";
import { PrivacyContent, privacyMeta } from "@/content/legal/privacy";

export const metadata: Metadata = {
  title: privacyMeta.title,
  description: privacyMeta.description,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <DocPage title={privacyMeta.title} updated={privacyMeta.updated} legal>
      <PrivacyContent />
    </DocPage>
  );
}
