/**
 * Privacy policy for the pre-launch website and waitlist (English). DRAFT: a lawyer must review
 * it before launch (launchBlockers). It must match what the code really does: today the waitlist
 * form validates input but stores nothing (src/app/actions.ts).
 */
import { EmailLink, MissingValue } from "@/components/missing-value";
import { BRAND, COMPANY } from "@/config/site";

export const privacyMeta = {
  title: "Privacy policy",
  description: `How ${BRAND.name} handles personal data on this website and the early-access waitlist.`,
  updated: "Draft of 20 November 2026",
};

export function PrivacyContent() {
  const name = BRAND.name;
  return (
    <>
      <h2>Who we are</h2>
      <p>
        {name} (“we”, “us”) is run by <MissingValue value={COMPANY.legalName} />,{" "}
        <MissingValue value={COMPANY.postalAddress} />. We are the controller of the personal data
        described in this policy. For privacy questions, email{" "}
        <EmailLink email={COMPANY.privacyEmail} />.
      </p>
      <p>
        This policy covers this website and the early-access waitlist. The product itself is still
        being built. Before it launches, we will update this policy and tell waitlist members.
      </p>

      <h2>What we collect</h2>
      <h3>When you join the waitlist</h3>
      <ul>
        <li>
          <strong>Your email address</strong> (required).
        </li>
        <li>
          <strong>Optional answers:</strong> which describes you best, a link to your channel, how
          many long videos you publish a month, how long you spend editing one video, and the main
          language of your videos.
        </li>
        <li>
          <strong>Your consent:</strong> that you agreed to receive emails from us, and when.
        </li>
      </ul>
      <p>
        Sign-ups are not open yet. Until they are, the form checks what you type but does not store
        it.
      </p>
      <h3>When you visit the website</h3>
      <p>
        Our hosting provider records technical data, such as your IP address, browser type and the
        pages you request, to deliver the website and keep it secure. This website does not use
        advertising or analytics cookies. If that changes, we will update this policy first and ask
        for your consent where the law requires it.
      </p>

      <h2>How we use it, and why we are allowed to</h2>
      <ul>
        <li>
          To email you about early access and founding pre-orders. Legal basis:{" "}
          <strong>your consent</strong>. You can withdraw it at any time with the unsubscribe link
          in every email.
        </li>
        <li>
          To decide who to invite first, and which features and languages to build first, using your
          optional answers. Legal basis: <strong>your consent</strong>.
        </li>
        <li>
          To run the website and keep it secure. Legal basis: our{" "}
          <strong>legitimate interest</strong> in providing a working, safe website.
        </li>
      </ul>
      <p>
        We do not sell your personal information or share it for targeted advertising, and we do not
        use waitlist data to train AI models.
      </p>

      <h2>Who we share it with</h2>
      <p>
        Only with service providers that host the website, store the waitlist and send our emails.
        They may use your data only on our instructions. We will name each provider here before
        sign-ups open: <MissingValue value={null} />
      </p>
      <p>We may also disclose data when the law requires it.</p>

      <h2>International transfers</h2>
      <p>
        Our providers may process data in countries other than yours, including the United States.
        Where the law requires it, we use safeguards such as the European Commission’s Standard
        Contractual Clauses and the UK International Data Transfer Addendum.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your waitlist details until you unsubscribe, ask us to delete them, or we close the
        waitlist, whichever comes first. Retention period after the waitlist closes:{" "}
        <MissingValue value={null} />
      </p>
      <p>
        Website logs are kept by our hosting provider for a short period:{" "}
        <MissingValue value={null} />
      </p>

      <h2>Your rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>get a copy of the personal data we hold about you;</li>
        <li>correct it;</li>
        <li>have it deleted;</li>
        <li>restrict or object to how we use it;</li>
        <li>receive it in a portable format;</li>
        <li>withdraw your consent at any time, without affecting what we did before;</li>
        <li>complain to a data protection authority.</li>
      </ul>
      <p>
        These rights come from laws such as the EU and UK General Data Protection Regulation, the
        California Consumer Privacy Act, Canada’s Personal Information Protection and Electronic
        Documents Act, Australia’s Privacy Act and the UAE’s Personal Data Protection Law. To use
        any of them, email <EmailLink email={COMPANY.privacyEmail} />. We may need to confirm your
        identity first, and we will reply within the time the law requires. We will not treat you
        differently for using your rights.
      </p>

      <h2>YouTube data</h2>
      <p>
        This website and the waitlist do not access your YouTube account. The product will offer an
        optional, read-only YouTube connection. Before that launches, this section will explain what
        YouTube data we access, store and share, and why.
      </p>
      <p>
        If you connect YouTube, you also agree to the{" "}
        <a href="https://www.youtube.com/t/terms">YouTube Terms of Service</a>, and Google’s use of
        your data is covered by the{" "}
        <a href="https://policies.google.com/privacy">Google Privacy Policy</a>. You will be able to
        remove our access at any time on the{" "}
        <a href="https://security.google.com/settings/security/permissions">
          Google security settings page
        </a>
        .
      </p>

      <h2>Children</h2>
      <p>
        This website and the waitlist are not meant for children under 16, and we do not knowingly
        collect their data. If you think a child has given us their details, contact us and we will
        delete them.
      </p>

      <h2>Security</h2>
      <p>
        The website is served only over an encrypted connection (HTTPS), and only the people who
        need personal data to do their work can access it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        When we change this policy, we will update the date at the top of this page. If a change is
        significant, we will email waitlist members before it takes effect.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions: <EmailLink email={COMPANY.privacyEmail} />
        <br />
        Post: <MissingValue value={COMPANY.legalName} />,{" "}
        <MissingValue value={COMPANY.postalAddress} />
      </p>
    </>
  );
}
