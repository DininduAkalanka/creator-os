import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/privacy", "/terms", "/about"] as const;

test.describe("home page", () => {
  test("gives screen readers the clean headline, without the struck-out filler word", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Your raw recording, rough-cut and captioned in minutes.",
    );
  });

  test("cut demo: accept all, keep one, start over", async ({ page }) => {
    await page.goto("/");
    await page.locator("#try-it").scrollIntoViewIfNeeded();
    const demo = page.getByRole("figure", { name: "Suggested cuts" });
    const length = (value: string) => demo.getByText(value, { exact: true });

    // The demo code loads only when scrolled to, so allow extra time for the first render.
    await expect(length("0:27.0")).toBeVisible({ timeout: 20_000 });

    await demo.getByRole("button", { name: "Accept all cuts" }).click();
    await expect(length("0:14.3")).toBeVisible();
    const filler = demo.getByRole("button", { name: /^Cut filler:/ });
    await expect(filler).toHaveAttribute("aria-pressed", "true");

    // Keep the filler words after all: the clip gets 1.9 s longer.
    await filler.click();
    await expect(filler).toHaveAttribute("aria-pressed", "false");
    await expect(length("0:16.2")).toBeVisible();

    await demo.getByRole("button", { name: "Start over" }).click();
    await expect(length("0:27.0")).toBeVisible();
  });

  test("cut demo works from the keyboard", async ({ page }) => {
    await page.goto("/");
    await page.locator("#try-it").scrollIntoViewIfNeeded();
    const demo = page.getByRole("figure", { name: "Suggested cuts" });
    const retake = demo.getByRole("button", { name: /^Cut retake:/ });
    await expect(retake).toBeVisible({ timeout: 20_000 });
    await retake.focus();
    await page.keyboard.press("Enter");
    await expect(retake).toHaveAttribute("aria-pressed", "true");
    await expect(demo.getByText("0:23.2", { exact: true })).toBeVisible();
  });
});

test.describe("hero slideshow", () => {
  test("tabs switch the slide, and arrow keys move between tabs", async ({ page }) => {
    await page.goto("/");
    const auditTab = page.getByRole("tab", { name: /Channel Audit/ });
    await auditTab.click();
    await expect(auditTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { name: "See what your channel is already telling you." }),
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");
    const nextTab = page.getByRole("tab", { name: /What to film next/ });
    await expect(nextTab).toBeFocused();
    await expect(nextTab).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: /Rough cut/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("pausing stops the slideshow from advancing", async ({ page }) => {
    await page.goto("/");
    const pause = page.getByRole("button", { name: "Pause slideshow and video" });
    await expect(pause).toBeVisible({ timeout: 15_000 });
    await pause.click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(9000);
    await expect(page.getByRole("tab", { name: /Rough cut/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("shows every service, each with an honest status", async ({ page }) => {
    await page.goto("/");
    const product = page.locator("#product");
    for (const name of [
      "AI rough cut",
      "Free Channel Audit",
      "What to film next",
      "Editor review",
    ]) {
      await expect(product.getByRole("heading", { name, exact: true })).toBeVisible();
    }
    await expect(page.locator("#channel-audit")).toContainText("Preview with example data");
    await expect(page.locator("#next-video")).toContainText("Example data for illustration");
  });
});

test.describe("media", () => {
  test("hero video can be paused and resumed", async ({ page }) => {
    await page.goto("/");
    const canPlayMp4 = await page.evaluate(
      () => document.createElement("video").canPlayType('video/mp4; codecs="avc1.42E01E"') !== "",
    );
    test.skip(!canPlayMp4, "This browser build has no H.264 decoder (open-source Chromium in CI).");
    const pause = page.getByRole("button", { name: "Pause slideshow and video" }).first();
    await expect(pause).toBeVisible({ timeout: 15_000 });
    await pause.click();
    await expect(
      page.getByRole("button", { name: "Play slideshow and video" }).first(),
    ).toBeVisible();
  });

  test("does not load videos below the fold until they are scrolled to", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/videos/")) requested.push(request.url());
    });
    await page.goto("/");
    await page.waitForTimeout(3000);
    expect(requested.some((url) => url.includes("talking-loop"))).toBe(false);
  });

  test("labels every photo and video as AI-generated", async ({ page }) => {
    await page.goto("/");
    const figures = page.locator("main figure:has(img)");
    const labelled = page.locator("main figure:has(img)", { hasText: /AI-generated/ });
    // The demo figure has no photo; every figure with a photo carries the label.
    await expect(labelled).toHaveCount(await figures.count());
    await expect(page.getByText("AI-generated video").first()).toBeVisible();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("shows still images instead of playing any video", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("video")).toHaveCount(0);
  });
});

test.describe("waitlist form", () => {
  test("shows field errors, then says honestly that sign-ups are not open", async ({ page }) => {
    await page.goto("/#waitlist");
    const form = page.locator("#waitlist form");
    const submit = form.getByRole("button", { name: "Join the waitlist" });
    const email = form.getByLabel("Email", { exact: true });

    await submit.click();
    await expect(form.getByRole("alert")).toHaveText("Please fix the highlighted fields.");
    await expect(email).toHaveAttribute("aria-invalid", "true");

    await email.fill("creator@example.com");
    await form.getByRole("checkbox").check();
    await submit.click();
    await expect(form.getByRole("status")).toContainText("Sign-ups aren't open yet");
    await expect(email).toHaveValue("creator@example.com");
    await expect(form.getByRole("alert")).toHaveCount(0);
  });
});

test.describe("navigation", () => {
  test("mobile menu opens, and Escape closes it and returns focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "The menu button only exists on small screens.");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(page.getByRole("link", { name: "Plans", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.getByRole("link", { name: "Plans", exact: true })).toBeHidden();
  });

  test("unknown pages return 404 with a way home", async ({ page }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Go to the home page" })).toBeVisible();
  });
});

test.describe("quality gates", () => {
  test.use({ reducedMotion: "reduce" });

  for (const path of PAGES) {
    test(`no WCAG 2.2 AA violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const violations = results.violations.flatMap((violation) =>
        violation.nodes.map(
          (node) =>
            `${violation.id} (${violation.impact}) ${node.target.join(" ")}: ${
              node.any[0]?.message ?? node.failureSummary ?? ""
            }`,
        ),
      );
      expect(violations).toEqual([]);
    });

    test(`no horizontal scrolling on ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("sends security headers and hides the framework", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("keeps search engines out of previews", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /");
  });
});
