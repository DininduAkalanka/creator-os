import Link from "next/link";
import { LogoSymbol } from "@/components/logo";
import { buttonPrimary, container } from "@/components/styles";
import { siteCopy } from "@/content/site";

export default function NotFound() {
  const { notFound } = siteCopy;
  return (
    <div className={`${container} max-w-2xl py-24 text-center`}>
      <LogoSymbol decorative className="mx-auto mb-8 h-20 w-auto text-navy" />
      <p className="detail text-muted">404</p>
      <h1 className="display mt-3 text-5xl">{notFound.heading}</h1>
      <p className="mt-4 text-muted">{notFound.body}</p>
      <Link href="/" className={`${buttonPrimary} mt-8`}>
        {notFound.back}
      </Link>
    </div>
  );
}
