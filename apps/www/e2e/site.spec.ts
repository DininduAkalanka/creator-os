import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const PAGES = ["/", "/privacy", "/terms", "/about"] as const;

/** A CSS colour as [red, green, blue, alpha 0–1], whatever form the browser reports it in. */
function rgba(locator: Locator, property: "background-color" | "color" = "background-color") {
  return locator.evaluate((element, name) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("No 2D canvas.");
    context.fillStyle = getComputedStyle(element).getPropertyValue(name);
    context.fillRect(0, 0, 1, 1);
    const [red = 0, green = 0, blue = 0, alpha = 0] = context.getImageData(0, 0, 1, 1).data;
    return [red, green, blue, Math.round((alpha / 255) * 100) / 100];
  }, property);
}

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

  test("the menu floats over the hero, then is a white bar once the page scrolls", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    const bar = header.locator(":scope > div");
    const logo = header.getByRole("link", { name: "CreatorOS", exact: true });
    // At the top of the home page there is no bar: white words on the hero's media (adobe.com).
    await expect(header).toHaveAttribute("data-overlay", "true");
    expect((await rgba(bar))[3]).toBe(0);
    expect(await rgba(logo, "color")).toEqual([255, 255, 255, 1]);

    // Scrolled: a solid white bar with the logo in navy, as on adobe.com. (v6.3's see-through
    // bar turned grey over the dark hero, with the headline smudged behind it.)
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-overlay", "false");
    await expect.poll(async () => (await rgba(logo, "color")).join()).toBe("11,10,71,1");
    await expect.poll(async () => (await rgba(bar)).join()).toBe("255,255,255,1");

    // Every other page starts with the solid white bar.
    await page.goto("/privacy");
    await expect(header).toHaveAttribute("data-overlay", "false");
    expect(await rgba(bar)).toEqual([255, 255, 255, 1]);
  });

  test("service icons are our own drawings, never letters", async ({ page }) => {
    await page.goto("/");
    const icons = page.locator(".service-icon");
    expect(await icons.count()).toBeGreaterThan(10);
    const notDrawn = await icons.evaluateAll(
      (all) =>
        all.filter((icon) => (icon.textContent ?? "").trim() !== "" || !icon.querySelector("svg"))
          .length,
    );
    expect(notDrawn).toBe(0);
  });

  test("how it works: four steps, each shown in a picture", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#how-it-works");
    await expect(
      section.getByRole("heading", { name: "From recording to timeline in four steps." }),
    ).toBeVisible();
    await expect(section.getByRole("listitem")).toHaveCount(4);
    await expect(section.getByRole("heading", { level: 3 })).toHaveText([
      "Drop in your recording",
      "See every cut on your transcript",
      "Review it, alone or with your editor",
      "Open it in your editor",
    ]);
    // The pictures are drawn in code and labelled honestly as illustrations. Step 1's picture
    // shows the video staying on the creator's drive while only the audio uploads.
    await expect(section).toContainText("Illustrations of the planned product.");
    await expect(section.getByText("Video stays on your drive", { exact: true })).toBeVisible();
    await expect(section.getByText("Audio only", { exact: true })).toBeVisible();
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

    // Generous time for the first render on a slow machine (the demo comes with the page).
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
  /** The page has two tab lists (the hero and the services); these tests are about the hero. */
  const heroOf = (page: Page) => page.locator('section[aria-roledescription="carousel"]');

  test("tabs switch the slide, and arrow keys move between tabs", async ({ page }) => {
    await page.goto("/");
    const auditTab = heroOf(page).getByRole("tab", { name: /Channel Audit/ });
    await auditTab.click();
    await expect(auditTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { name: "See what your channel is already telling you." }),
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");
    const nextTab = heroOf(page).getByRole("tab", { name: /What to film next/ });
    await expect(nextTab).toBeFocused();
    await expect(nextTab).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(heroOf(page).getByRole("tab", { name: /Rough cut/ })).toHaveAttribute(
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
    await expect(heroOf(page).getByRole("tab", { name: /Rough cut/ })).toHaveAttribute(
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
    await expect(heroOf(page).getByRole("tab", { name: /Captions/ })).toHaveAttribute(
      "aria-selected",
      "true",
      { timeout: 12_000 },
    );
  });

  test("a slide change never shows two slides' words at once", async ({ page }) => {
    await page.goto("/");
    // Interactive (and motion allowed) once the pause button is there.
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    // Watch every frame for a second after the click: of all the slides' word panels, the
    // second most visible one must stay (nearly) invisible. v6.3 crossfaded both over 700 ms.
    const overlap = await heroOf(page).evaluate(async (hero) => {
      const panels = [...hero.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
      const tab = hero.querySelector<HTMLElement>('[role="tab"][aria-selected="false"]');
      if (!tab) throw new Error("No other slide to switch to.");
      tab.click();
      let worst = 0;
      const until = performance.now() + 1000;
      while (performance.now() < until) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const shown = panels
          .map((panel) => Number(getComputedStyle(panel).opacity))
          .sort((a, b) => b - a);
        worst = Math.max(worst, shown[1] ?? 0);
      }
      return worst;
    });
    expect(overlap).toBeLessThanOrEqual(0.1);
  });

  test("the pause button arriving never moves the tab cards", async ({ page, browser }) => {
    // The server's page (no JavaScript) against the running one: the tab row must be identical,
    // because the button's place is kept from the first paint. v6.3 shifted it 10 to 31 px.
    const tabsBox = (target: Page) =>
      heroOf(target)
        .getByRole("tablist")
        .evaluate((list) => {
          const box = list.getBoundingClientRect();
          return { x: Math.round(box.x), width: Math.round(box.width) };
        });
    const viewport = page.viewportSize();
    const still = await browser.newContext({ javaScriptEnabled: false, viewport });
    const serverPage = await still.newPage();
    await serverPage.goto("/");
    const before = await tabsBox(serverPage);
    await still.close();

    await page.goto("/");
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    expect(await tabsBox(page)).toEqual(before);
  });

  test("on a 27-inch screen the menu bar and the hero use the full width", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "This is about very wide screens.");
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto("/");
    const width = (locator: Locator) =>
      locator.evaluate((element) => element.getBoundingClientRect().width);
    // adobe.com never caps its bar or its hero; v6.3 capped both at 1600 px (white bands).
    expect(await width(page.getByRole("banner").locator(":scope > div"))).toBeGreaterThan(2500);
    expect(await width(page.locator("[data-hero-stage]"))).toBeGreaterThan(2500);
    // The menu opens at a readable width instead of stretching across the screen.
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    const nav = page.getByRole("navigation", { name: "Main" });
    await nav.getByRole("button", { name: "Product" }).click();
    const panel = nav.locator('[id$="-panel"]');
    await expect(panel).toBeVisible();
    expect(await width(panel)).toBeLessThanOrEqual(1440);
  });

  test("holds while the pointer is on the tabs, then carries on", async ({ page, isMobile }) => {
    test.skip(isMobile, "Hover needs a mouse.");
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    const progress = page.locator('section[aria-roledescription="carousel"] .tab-progress');
    await heroOf(page)
      .getByRole("tab", { name: /Editor review/ })
      .hover();
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
    const captions = heroOf(page).getByRole("tab", { name: /Captions/ });
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
    await expect(heroOf(page).getByRole("tab", { name: /Rough cut/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("the words never run into the tab cards or the media's label", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    const box = async (locator: Locator) => {
      const found = await locator.boundingBox();
      if (!found) throw new Error("No box: the element is not rendered.");
      return found;
    };
    type Box = Awaited<ReturnType<typeof box>>;
    const overlap = (a: Box, b: Box) =>
      a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

    const words = await box(
      heroOf(page).locator('[role="tabpanel"]:not([inert]) .hero-lift > div'),
    );
    const tabs = await box(heroOf(page).getByRole("tablist"));
    const label = await box(heroOf(page).locator("[data-media-label]"));
    expect(words.y + words.height).toBeLessThanOrEqual(tabs.y);
    expect(overlap(words, label)).toBe(false);
    expect(overlap(label, tabs)).toBe(false);
    // On a laptop screen the tab cards are part of the first screen, as on adobe.com.
    if (!isMobile) {
      const height = page.viewportSize()?.height ?? 0;
      expect(tabs.y + tabs.height).toBeLessThanOrEqual(height);
    }
  });

  test("previews come with an honest example-data label", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#channel-audit")).toContainText("Preview with example data");
    await expect(page.locator("#next-video")).toContainText("Example data for illustration");
  });
});

test.describe("services switcher", () => {
  /** The switcher in the middle of the screen (where its tour runs), ready to use. */
  async function showServices(page: Page) {
    await page.goto("/");
    const services = page.getByRole("tablist", { name: "Services" });
    await services.evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    return services;
  }

  test("lists every service in full, each with an honest status", async ({ page }) => {
    const services = await showServices(page);
    await expect(services.getByRole("tab")).toHaveCount(6);
    for (const [name, status] of [
      ["AI rough cut", "First release"],
      ["Captions, chapters & titles", "First release"],
      ["Export to your editor", "First release"],
      ["Editor review", "Beta"],
      ["Free Channel Audit", "Beta"],
      ["What to film next", "Beta"],
    ] as const) {
      const tab = services.getByRole("tab").filter({ hasText: name });
      await expect(tab).toHaveCount(1);
      await expect(tab).toContainText(status);
    }
  });

  test("choosing a service shows it on the stage, and arrow keys move between services", async ({
    page,
  }) => {
    const services = await showServices(page);
    const audit = services.getByRole("tab", { name: /Free Channel Audit/ });
    await audit.click();
    await expect(audit).toHaveAttribute("aria-selected", "true");
    const stage = page.locator("[data-service-stage]");
    await expect(stage.getByRole("heading", { name: "Free Channel Audit" })).toBeVisible();
    await expect(stage).toContainText("Read-only insights from your own channel");
    await expect(
      stage.getByRole("link", { name: "More about Free Channel Audit" }),
    ).toHaveAttribute("href", "#channel-audit");

    await page.keyboard.press("ArrowDown");
    const next = services.getByRole("tab", { name: /What to film next/ });
    await expect(next).toBeFocused();
    await expect(next).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(services.getByRole("tab", { name: /AI rough cut/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("moves on by itself, and the pause button stops it", async ({ page }) => {
    const services = await showServices(page);
    await page.mouse.move(5, 5);
    const selected = () => services.locator('[aria-selected="true"]').textContent();
    const start = await selected();
    await expect.poll(selected, { timeout: 12_000 }).not.toBe(start);

    await page.getByRole("button", { name: "Pause the tour of the services" }).click();
    await page.mouse.move(5, 5);
    const paused = await selected();
    await page.waitForTimeout(8_000);
    expect(await selected()).toBe(paused);
    await expect(page.getByRole("button", { name: "Play the tour of the services" })).toBeVisible();
  });

  test("on phones the services are chips that scroll sideways, and the stage swipes", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Large screens show the list beside the stage.");
    const services = await showServices(page);
    expect(await services.evaluate((list) => list.scrollWidth > list.clientWidth)).toBe(true);

    // Start from a known service (a tap also stops the tour), then swipe to the next one.
    await services.getByRole("tab", { name: /AI rough cut/ }).click();
    const stage = page.locator("[data-service-stage]");
    const box = await stage.boundingBox();
    if (!box) throw new Error("The services stage has no size.");
    const touch = { pointerId: 1, pointerType: "touch", isPrimary: true, clientY: box.y + 80 };
    await stage.dispatchEvent("pointerdown", { ...touch, clientX: box.x + box.width * 0.85 });
    await stage.dispatchEvent("pointerup", { ...touch, clientX: box.x + box.width * 0.15 });
    await expect(services.getByRole("tab", { name: /Captions, chapters/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
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
    await expect(page.getByRole("button", { name: "Pause the tour of the services" })).toHaveCount(
      0,
    );
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

  test("the logo always brings back the home page afresh, at the top", async ({ page }) => {
    // Reduced motion: the slideshow stays where it is put, so "back on the first slide" can only
    // come from the reload, however slowly the page loads. (Its tabs still work by click.)
    await page.emulateMedia({ reducedMotion: "reduce" });
    const logo = page.getByRole("banner").getByRole("link", { name: "CreatorOS", exact: true });
    const atTop = () => expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
    const hero = page.locator('section[aria-roledescription="carousel"]');
    const firstSlide = hero.getByRole("tab", { name: /Rough cut/ });
    const thirdSlide = hero.getByRole("tab", { name: /Editor review/ });
    // "domcontentloaded", not "load": Edge holds the load event back while lazy images load.
    const reloadBy = (click: Promise<void>) =>
      Promise.all([page.waitForEvent("domcontentloaded"), click]);

    // On the home page, scrolled down and on another slide: the logo reloads it (v6.4 did
    // nothing here, so the logo looked broken).
    await page.goto("/");
    // A click before the page is interactive is lost: retry until the slide has changed.
    await expect(async () => {
      await thirdSlide.click();
      await expect(thirdSlide).toHaveAttribute("aria-selected", "true", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: "instant" }));
    await reloadBy(logo.click());
    await atTop();
    await expect(firstSlide).toHaveAttribute("aria-selected", "true");

    // After a section link the address has a #section; the logo drops it.
    await page.goto("/#plans");
    await reloadBy(logo.click());
    await expect(page).toHaveURL(/\/$/);
    await atTop();

    // From another page it lands at the top (v6.4 stopped 703 px down: an animated scroll).
    await page.goto("/privacy");
    await logo.click();
    await expect(page).toHaveURL(/\/$/);
    await atTop();
  });

  test("a section link works again after scrolling away from its section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Pause slideshow and video" })).toBeVisible({
      timeout: 15_000,
    });
    const join = page
      .locator('section[aria-roledescription="carousel"]')
      .getByRole("link", { name: "Join early access" });
    const waitlistTop = () =>
      page.evaluate(() =>
        Math.round(document.getElementById("waitlist")?.getBoundingClientRect().top ?? 99_999),
      );
    // Brought into view: its top in the upper third of the screen, not under the header.
    const third = (page.viewportSize()?.height ?? 720) / 3;
    await join.click();
    await expect(page).toHaveURL(/#waitlist$/);
    await expect.poll(waitlistTop).toBeLessThan(third);

    // Back to the top and the same link again: the address is already /#waitlist, and v6.4 did
    // nothing here (a Next.js Link to the current address does not navigate).
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await join.click();
    await expect.poll(waitlistTop).toBeLessThan(third);
    expect(await waitlistTop()).toBeGreaterThan(0);
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
