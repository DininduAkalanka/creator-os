import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

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

  test("is white by default, and dark only where it is meant to be", async ({ page }) => {
    await page.goto("/");
    const background = (locator: Locator) =>
      locator.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(await background(page.locator("body"))).toBe("rgb(255, 255, 255)");
    // The header is a white bar (adobe.com), not a dark one.
    expect(await background(page.locator("header > div").first())).toBe("rgb(255, 255, 255)");
    // Dark sections are the "Later" band and the sign-up at the end, then the footer.
    const dark = await page
      .locator("main section.theme-dark")
      .evaluateAll((sections) => sections.map((section) => section.id));
    expect(dark).toEqual(["roadmap", "waitlist"]);
    await expect(page.locator("body > footer")).toHaveClass(/theme-dark/);

    // Long text pages are white too.
    await page.goto("/privacy");
    expect(await background(page.locator("body"))).toBe("rgb(255, 255, 255)");
    await expect(page.locator("main .theme-dark")).toHaveCount(0);
  });

  test("the struck-out word stays readable after it is cut", async ({ page }) => {
    // With motion on, "um," fades once it is struck through. The quality gates below run with
    // reduced motion (no fade), so check the faded state here: it must keep 3:1 on white.
    await page.goto("/");
    await page.waitForTimeout(2500); // the strike and fade end at 1.9 s
    const results = await new AxeBuilder({ page })
      .include(".hero-cut")
      .withRules(["color-contrast"])
      .analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
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

  test("keeps going while the mouse rests on a slide", async ({ page, isMobile }) => {
    test.skip(isMobile, "A phone has no resting mouse.");
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    // v4 stopped for good here: on a large hero the mouse is nearly always over a slide.
    const stage = page.locator("[data-hero-stage]");
    await stage.scrollIntoViewIfNeeded();
    const box = await stage.boundingBox();
    if (!box) throw new Error("The hero stage has no size.");
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
    await expect(page.getByRole("tab", { name: /Captions/ })).toHaveAttribute(
      "aria-selected",
      "true",
      { timeout: 12_000 },
    );
  });

  test("holds while the pointer is on the tabs, then carries on", async ({ page, isMobile }) => {
    test.skip(isMobile, "Hover needs a mouse.");
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    const progress = page.locator('section[aria-roledescription="carousel"] .tab-progress');
    await page.getByRole("tab", { name: /Editor review/ }).hover();
    await expect(progress).toHaveCSS("animation-play-state", "paused");
    await page.mouse.move(5, 300);
    await expect(progress).toHaveCSS("animation-play-state", "running");
  });

  test("swipes between slides on a touch screen", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Swiping is for touch screens.");
    await page.goto("/");
    // Pause first, so the automatic rotation can't move the slide during the test.
    const pause = page.getByRole("button", { name: "Pause slideshow and video" });
    await expect(pause).toBeVisible({ timeout: 15_000 });
    await pause.click();
    // Swipes belong to the stage (the media); the message above it is text to read.
    const stage = page.locator("[data-hero-stage]");
    const box = await stage.boundingBox();
    if (!box) throw new Error("The hero stage has no size.");
    const y = box.y + box.height * 0.35;
    const swipe = async (from: number, to: number) => {
      const touch = { pointerId: 1, pointerType: "touch", isPrimary: true, clientY: y };
      await stage.dispatchEvent("pointerdown", { ...touch, clientX: box.x + box.width * from });
      await stage.dispatchEvent("pointerup", { ...touch, clientX: box.x + box.width * to });
    };
    await swipe(0.85, 0.15);
    const captions = page.getByRole("tab", { name: /Captions/ });
    await expect(captions).toHaveAttribute("aria-selected", "true");
    // The sideways-scrolling tab bar follows, so the active tab is fully in view.
    await expect
      .poll(() =>
        captions.evaluate((tab) => {
          const bar = tab.parentElement?.getBoundingClientRect();
          const box = tab.getBoundingClientRect();
          return Boolean(bar && box.left >= bar.left - 1 && box.right <= bar.right + 1);
        }),
      )
      .toBe(true);
    await swipe(0.15, 0.85);
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

test.describe("services row", () => {
  test("a card opens wide when the mouse rests on it, like adobe.com", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Phones get a row that scrolls sideways instead.");
    await page.goto("/");
    const cards = page.locator("#product li[data-open]");
    await expect(cards).toHaveCount(6);
    await expect(cards.first()).toHaveAttribute("data-open", "true");

    const audit = cards.filter({ hasText: "Free Channel Audit" });
    await audit.evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await audit.hover();
    await expect(audit).toHaveAttribute("data-open", "true");
    await expect(cards.first()).toHaveAttribute("data-open", "false");
    // Really wider, not just marked: an open card is several times a closed one.
    await expect
      .poll(async () => {
        const [open, closed] = await Promise.all([
          audit.boundingBox(),
          cards.first().boundingBox(),
        ]);
        return (open?.width ?? 0) / (closed?.width ?? 1);
      })
      .toBeGreaterThan(2);
  });

  test("keyboard focus opens a card too", async ({ page, isMobile }) => {
    test.skip(isMobile, "On phones every card is open.");
    await page.goto("/");
    const card = page.locator("#product li[data-open]").filter({ hasText: "Editor review" });
    await card.getByRole("link").focus();
    await expect(card).toHaveAttribute("data-open", "true");
  });

  test("on phones the cards scroll sideways", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Large screens show the opening row.");
    await page.goto("/");
    const row = page.locator("#product li[data-open]").first().locator("xpath=..");
    expect(await row.evaluate((list) => list.scrollWidth > list.clientWidth)).toBe(true);
  });
});

test.describe("questions", () => {
  test("a question opens to show its answer", async ({ page }) => {
    await page.goto("/");
    const question = page.locator("#faq details").first();
    await question.locator("summary").click();
    await expect(question).toHaveAttribute("open", "");
    await expect(question.locator("p")).toBeVisible();
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

test.describe("story slider", () => {
  /**
   * Opens the home page with the whole slider in the middle of the screen, ready to use. The
   * scroll is instant on purpose: the page scrolls smoothly, and a click measured mid-scroll misses.
   */
  async function showStories(page: Page) {
    await page.goto("/");
    const slider = page.getByRole("group", { name: "Who it's for" });
    await slider.evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    // The pause button appears once the slider is interactive (hydrated); clicks before that are lost.
    await expect(page.getByRole("button", { name: "Pause stories" })).toBeVisible();
    return slider;
  }

  /**
   * The slider moves on by itself, and on a slow machine it may already have done so: pause it and
   * go to the first story, so each test starts from a known place.
   */
  async function pausedAtFirstStory(page: Page) {
    const slider = await showStories(page);
    await page.getByRole("button", { name: "Pause stories" }).click();
    const first = page.getByRole("button", { name: "Story 1 of 3" });
    await first.click();
    await expect(first).toHaveAttribute("aria-current", "true");
    return slider;
  }

  test("the dots move between stories", async ({ page }) => {
    await showStories(page);
    const third = page.getByRole("button", { name: "Story 3 of 3" });
    await third.click();
    await expect(third).toHaveAttribute("aria-current", "true");
    await expect(page.getByRole("button", { name: "Story 1 of 3" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  test("the arrows move between stories and go round", async ({ page, isMobile }) => {
    test.skip(isMobile, "Phones swipe or use the dots; the arrows are for larger screens.");
    await pausedAtFirstStory(page);
    const third = page.getByRole("button", { name: "Story 3 of 3" });
    await page.getByRole("button", { name: "Previous story" }).click();
    await expect(third).toHaveAttribute("aria-current", "true");
    await page.getByRole("button", { name: "Next story" }).click();
    await expect(page.getByRole("button", { name: "Story 1 of 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("moves on by itself, and the pause button stops it", async ({ page }) => {
    const slider = await showStories(page);
    await page.mouse.move(5, 5);
    const current = () => slider.locator('button[aria-current="true"]').getAttribute("aria-label");
    const start = await current();
    await expect.poll(current, { timeout: 12_000 }).not.toBe(start);

    await page.getByRole("button", { name: "Pause stories" }).click();
    await page.mouse.move(5, 5);
    const paused = await current();
    await page.waitForTimeout(8_000);
    expect(await current()).toBe(paused);
    await expect(page.getByRole("button", { name: "Play stories" })).toBeVisible();
  });

  test("drags to the next story with the mouse", async ({ page, isMobile }) => {
    test.skip(isMobile, "Phones swipe (tested separately).");
    const slider = await pausedAtFirstStory(page);
    const box = await slider.boundingBox();
    if (!box) throw new Error("The story slider has no size.");
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    for (let step = 1; step <= 10; step++) {
      await page.mouse.move(box.x + box.width * (0.7 - step * 0.04), y);
    }
    await page.mouse.up();
    await expect(page.getByRole("button", { name: "Story 2 of 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("swipes to the next story with a finger", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Swiping is for touch screens.");
    const slider = await pausedAtFirstStory(page);
    const box = await slider.boundingBox();
    if (!box) throw new Error("The story slider has no size.");
    // A real touch gesture (Chromium DevTools protocol), so the browser's own touch handling runs.
    const cdp = await page.context().newCDPSession(page);
    const y = box.y + box.height / 2;
    const touch = (x: number) => [{ x: box.x + box.width * x, y }];
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touch(0.8) });
    for (let step = 1; step <= 8; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: touch(0.8 - step * 0.075),
      });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.getByRole("button", { name: "Story 2 of 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});

test.describe("product menu", () => {
  test("opens like adobe.com, switches areas, and closes with Escape", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "On phones, Product is a plain link in the menu.");
    await page.goto("/");
    // The hero's pause button appears once the page is interactive; clicks before that are lost.
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    const nav = page.getByRole("navigation", { name: "Main" });
    const button = nav.getByRole("button", { name: "Product" });
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(nav.getByRole("link", { name: /AI rough cut/ })).toBeVisible();

    await nav.getByRole("tab", { name: "Grow your channel" }).click();
    await expect(nav.getByRole("link", { name: /Free Channel Audit/ })).toBeVisible();
    await expect(nav.getByRole("link", { name: /AI rough cut/ })).toHaveCount(0);
    // Every card says honestly where it stands.
    await expect(nav.getByRole("tabpanel")).toContainText("Beta");

    const results = await new AxeBuilder({ page })
      .include("header")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);

    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("a card takes you to its section and closes the menu", async ({ page, isMobile }) => {
    test.skip(isMobile, "On phones, Product is a plain link in the menu.");
    await page.goto("/");
    // The hero's pause button appears once the page is interactive; clicks before that are lost.
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    const nav = page.getByRole("navigation", { name: "Main" });
    const button = nav.getByRole("button", { name: "Product" });
    await button.click();
    await nav.getByRole("tab", { name: "Coming later" }).click();
    await nav.getByRole("link", { name: /Publish to YouTube/ }).click();
    await expect(page).toHaveURL(/#roadmap$/);
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("scroll animations", () => {
  test("content below the first screen rises in when scrolled to", async ({ page }) => {
    await page.goto("/");
    const plan = page.locator("#plans li.reveal").first();
    await expect(plan).toHaveAttribute("data-reveal", "wait");
    // Nothing on the first screen is ever hidden (no blink, no delay to the main paint).
    const hiddenOnFirstScreen = await page.evaluate(
      () =>
        [...document.querySelectorAll("[data-reveal]")].filter(
          (element) => element.getBoundingClientRect().top < window.innerHeight,
        ).length,
    );
    expect(hiddenOnFirstScreen).toBe(0);

    await plan.scrollIntoViewIfNeeded();
    await expect(plan).toHaveCSS("opacity", "1");
    // Once shown, the element goes back to its own styles.
    await expect(plan).not.toHaveAttribute("data-reveal");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("shows still images instead of playing any video, and hides nothing", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
    // The "Later" photo is shown whole; it only opens like a garage door when motion is on.
    await expect(page.locator("#roadmap .door")).toHaveCSS("clip-path", "none");
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
  test("the header logo is named for screen readers and leads home", async ({ page }) => {
    await page.goto("/privacy");
    const home = page.getByRole("banner").getByRole("link", { name: "CreatorOS", exact: true });
    await expect(home).toBeVisible();
    await home.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("the footer lists every service, each linked to its section", async ({ page }) => {
    await page.goto("/privacy");
    const product = page.getByRole("navigation", { name: "Product", exact: true });
    await expect(product.getByRole("link")).toHaveCount(6);
    await product.getByRole("link", { name: "Free Channel Audit" }).click();
    await expect(page).toHaveURL(/\/#channel-audit$/);
  });

  test("the favicon and home-screen icon come from the logo and load", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const icons = page.locator('link[rel="icon"], link[rel="apple-touch-icon"]');
    await expect(icons).toHaveCount(2);
    const hrefs = await icons.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    );
    for (const href of hrefs) {
      expect(href).toBeTruthy();
      const response = await request.get(href ?? "");
      expect(response.ok()).toBe(true);
    }
  });

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
