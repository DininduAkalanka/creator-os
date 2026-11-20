/**
 * Terms for the pre-launch website and waitlist (English). DRAFT: a lawyer must review them
 * before launch (launchBlockers). The product will have its own terms before anyone can pay.
 */
import { EmailLink, MissingValue } from "@/components/missing-value";
import { BRAND, COMPANY } from "@/config/site";

export const termsMeta = {
  title: "Terms",
  description: `Terms of use for the ${BRAND.name} website and early-access waitlist.`,
  updated: "Draft of 20 November 2026",
};

export function TermsContent() {
  const name = BRAND.name;
  return (
    <>
      <h2>About these terms</h2>
      <p>
        These terms cover your use of this website and the {name} early-access waitlist. The website
        is run by <MissingValue value={COMPANY.legalName} />,{" "}
        <MissingValue value={COMPANY.postalAddress} />. By using the website or joining the
        waitlist, you agree to these terms.
      </p>
      <p>
        The {name} product will have its own terms. We will publish them before you can pay for or
        use the product.
      </p>

      <h2>The product is in development</h2>
      <p>
        Descriptions of features, illustrations and plans on this website describe what we intend to
        build, not a finished product. Details may change before launch.
      </p>

      <h2>The waitlist</h2>
      <ul>
        <li>Joining is free and does not commit you to buy anything.</li>
        <li>Joining does not guarantee access, a founding place or a launch date.</li>
        <li>You can leave at any time with the unsubscribe link in our emails.</li>
      </ul>

      <h2>The founding offer</h2>
      <p>
        The founding offer on this website is planned and may change before pre-orders open. The
        price, what is included and the refund terms that apply to you are the ones shown at
        checkout, before you pay.
      </p>

      <h2>Using the website</h2>
      <p>Please do not:</p>
      <ul>
        <li>try to break, overload or gain unauthorised access to the website;</li>
        <li>submit someone else’s email address or information that is not true;</li>
        <li>use automated tools to submit the waitlist form.</li>
      </ul>

      <h2>Content and trademarks</h2>
      <p>
        The text, design and graphics on this website belong to us or the people who licensed them
        to us. Other product names, such as YouTube, Premiere Pro, DaVinci Resolve and Final Cut
        Pro, belong to their owners. {name} is not affiliated with or endorsed by them.
      </p>

      <h2>No warranty</h2>
      <p>
        We provide the website “as is” and do not promise that it will always be available or free
        of errors, to the extent the law allows.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, we are not liable for indirect or consequential losses arising
        from your use of this website. Nothing in these terms limits any rights you have under
        consumer protection laws that cannot be excluded.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the law of: <MissingValue value={null} />
      </p>

      <h2>Changes to these terms</h2>
      <p>
        When we change these terms, we will update the date at the top of this page. The version on
        this page when you use the website is the one that applies.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <EmailLink email={COMPANY.contactEmail} />
      </p>
    </>
  );
}
