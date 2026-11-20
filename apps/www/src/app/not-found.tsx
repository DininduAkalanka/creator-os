import Link from "next/link";
import { buttonPrimary, container } from "@/components/styles";
import { siteCopy } from "@/content/site";

export default function NotFound() {
  const { notFound } = siteCopy;
  return (
    <div className={`${container} max-w-2xl py-24 text-center`}>
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{notFound.heading}</h1>
      <p className="mt-4 text-muted">{notFound.body}</p>
      <Link href="/" className={`${buttonPrimary} mt-8`}>
        {notFound.back}
      </Link>
    </div>
  );
}
