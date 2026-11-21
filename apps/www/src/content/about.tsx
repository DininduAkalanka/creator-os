/** About and contact page (English). No invented people, numbers or customers. */
import Link from "next/link";
import { EmailLink, MissingValue } from "@/components/missing-value";
import { BRAND, COMPANY } from "@/config/site";

export const aboutMeta = {
  title: "About and contact",
  description: `Who is building ${BRAND.name}, why, and how to get in touch.`,
};

export function AboutContent() {
  const name = BRAND.name;
  return (
    <>
      <h2>What we’re building</h2>
      <p>
        {name} is an AI first-pass editor for long-form YouTube creators. It suggests cuts for
        silences, filler words and bad takes, writes captions, chapters and title ideas, and hands a
        clean timeline to Premiere Pro, DaVinci Resolve or Final Cut Pro. Every cut is a suggestion,
        and creative decisions stay with the creator.
      </p>

      <h2>Why</h2>
      <p>
        Before the real editing starts, someone has to go through the raw footage and remove
        everything that shouldn’t be there. It’s slow, repetitive work, and it gets in the way of
        publishing more often. We want creators and their editors to spend that time on the parts of
        the video that need taste and judgement.
      </p>

      <h2>Who’s behind it</h2>
      <p>
        {name} is being built by <MissingValue value={COMPANY.founderName} />.
      </p>

      <h2>Where we are</h2>
      <p>
        {name} is in development and not available yet.{" "}
        <Link href="/#waitlist">Join the waitlist</Link> to hear when early access opens.
      </p>

      <h2>Contact</h2>
      <ul>
        <li>
          General questions: <EmailLink email={COMPANY.contactEmail} />
        </li>
        <li>
          Privacy questions: <EmailLink email={COMPANY.privacyEmail} />
        </li>
        <li>
          Company: <MissingValue value={COMPANY.legalName} />,{" "}
          <MissingValue value={COMPANY.postalAddress} />
        </li>
      </ul>
    </>
  );
}
