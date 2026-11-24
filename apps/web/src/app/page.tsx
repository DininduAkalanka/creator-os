import { BRAND } from "../config/brand";

/** The start page until the app shell (navigation, contents, review) arrives in M7. */
export default function Home() {
  return (
    <main>
      <h1>{BRAND.name}</h1>
      <p>The app is in development. Sign-in and your workspace come next.</p>
    </main>
  );
}
