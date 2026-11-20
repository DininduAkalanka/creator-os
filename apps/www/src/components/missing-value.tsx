import { siteCopy } from "@/content/site";

function Missing() {
  return <span className="font-medium text-danger">{siteCopy.missing}</span>;
}

/** Shows a company detail, or a visible "[to be added]" marker while it is unknown. */
export function MissingValue({ value }: { value: string | null }) {
  return value ? <>{value}</> : <Missing />;
}

/** A mailto link, or the "[to be added]" marker while the address is unknown. */
export function EmailLink({ email }: { email: string | null }) {
  return email ? <a href={`mailto:${email}`}>{email}</a> : <Missing />;
}
