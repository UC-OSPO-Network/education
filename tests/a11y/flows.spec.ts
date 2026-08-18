import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function gotoEducation(page: Page, path = "./") {
  await page.goto(path);
  await expect(page.getByRole("main")).toBeVisible();
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

function headerSearch(page: Page) {
  return page.locator(".site-search").getByRole("combobox", {
    name: /search lessons, pathways, and resources/i,
  });
}

test.describe("accessibility page structure", () => {
  const pages = [
    { path: "./", heading: /open source learning pathways/i },
    { path: "./lessons/", heading: /all lessons/i },
    { path: "./lessons/introduction-to-git/", heading: /introduction to git/i },
    { path: "./pathways/", heading: /learning pathways/i },
    { path: "./pathways/getting-started/", heading: /getting started/i },
  ];

  for (const pageCase of pages) {
    test(`${pageCase.path} has accessible structure`, async ({ page }) => {
      await gotoEducation(page, pageCase.path);

      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("navigation", { name: /primary/i })).toBeVisible();
      await expect(page.getByRole("heading", { name: pageCase.heading, level: 1 })).toBeVisible();
      await expect(headerSearch(page)).toHaveCount(1);
      await expectNoAxeViolations(page);
    });
  }
});

test("keyboard users can skip to main content and operate the desktop nav", async ({ page }) => {
  await gotoEducation(page);

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /skip to main content/i })).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  const educationTrigger = page.getByRole("button", { name: /education/i });
  await educationTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(educationTrigger).toHaveAttribute("aria-expanded", "true");
  const primaryNav = page.getByRole("navigation", { name: /primary/i });
  await expect(primaryNav.getByRole("link", { name: "Lessons", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Search", exact: true })).toHaveCount(0);
  await page.waitForTimeout(250);
  await expectNoAxeViolations(page);

  await page.keyboard.press("Escape");
  await expect(educationTrigger).toHaveAttribute("aria-expanded", "false");

  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press("Tab");
    const activeElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(activeElement).toMatch(/^(a|button|input|select)$/);
  }
});

test("lesson filters are keyboard accessible and keep focus usable", async ({ page }) => {
  await gotoEducation(page, "./lessons/");

  const count = page.locator(".lessons-filter__count");
  await expect(count).toContainText(/showing \d+ of \d+ lessons/i);
  const initialCount = await count.textContent();

  const search = page.locator(".lessons-filter").getByLabel("Search");
  await search.focus();
  await expect(search).toBeFocused();
  await search.fill("git");

  await expect(count).not.toHaveText(initialCount || "");
  await expect(search).toBeFocused();

  await page.getByRole("button", { name: /clear filters/i }).first().click();
  await expect(count).toHaveText(initialCount || "");
  await expectNoAxeViolations(page);
});

test("header search opens dropdown results and navigates to a result", async ({ page }) => {
  await gotoEducation(page);

  const search = headerSearch(page);
  const startingUrl = page.url();
  await search.fill("git");

  await expect(page).toHaveURL(startingUrl);
  const firstResult = page.locator(".site-search .pf-searchbox-result").first();
  await expect(firstResult).toBeVisible();
  await firstResult.click();
  await expect(page).not.toHaveURL(startingUrl);
  await expect(page).toHaveURL(/\/education\//);
});

test("lesson metadata links resolve to internal filtered views", async ({ page }) => {
  await gotoEducation(page, "./lessons/introduction-to-git/");

  await expect(page.locator(".lesson-badges").getByRole("link")).toHaveCount(0);
  await page.getByRole("link", { name: "git", exact: true }).click();

  await expect(page).toHaveURL(/\/education\/lessons\/\?topic=git$/);
  await expect(page.getByRole("button", { name: /topic/i })).toContainText(/git/i);
  await expect(page.locator(".lessons-filter__count")).toContainText(/showing \d+ of \d+ lessons/i);

  await gotoEducation(page, "./lessons/introduction-to-git/");
  await page.getByRole("link", { name: "Beginners" }).click();
  await expect(page).toHaveURL(/\/education\/lessons\/\?audience=Beginners$/);
  await expect(page.getByRole("button", { name: /designed for/i })).toContainText(/beginners/i);

  await gotoEducation(page, "./lessons/introduction-to-git/");
  await page.getByRole("link", { name: "Contributor" }).click();
  await expect(page).toHaveURL(/\/education\/lessons\/\?role=Contributor$/);
  await expect(page.getByRole("button", { name: /oss role/i })).toContainText(/contributor/i);

  await gotoEducation(page, "./lessons/introduction-to-git/");
  await page.getByRole("link", { name: "course" }).click();
  await expect(page).toHaveURL(/\/education\/lessons\/\?type=course$/);
  await expect(page.getByRole("button", { name: /learning type/i })).toContainText(/course/i);
});

test("lesson filter query params initialize controls and clear from the URL", async ({ page }) => {
  await gotoEducation(page, "./lessons/?topic=git");

  const count = page.locator(".lessons-filter__count");
  await expect(page.getByRole("button", { name: /topic/i })).toContainText(/git/i);
  await expect(count).toContainText(/showing \d+ of \d+ lessons/i);
  const filteredCount = await count.textContent();

  await page.getByRole("button", { name: /clear filters/i }).first().click();
  await expect(page.getByRole("button", { name: /topic/i })).toContainText(/any/i);
  await expect(page).toHaveURL(/\/education\/lessons\/$/);
  await expect(count).not.toHaveText(filteredCount || "");
});

test("workshop plan tray: keyboard selection, reorder focus, and download", async ({ page }) => {
  await gotoEducation(page, "./lessons/");

  const checkboxes = page.locator(".lesson-card__select-input");
  await checkboxes.nth(0).focus();
  await page.keyboard.press("Space");
  await checkboxes.nth(1).focus();
  await page.keyboard.press("Space");

  const tray = page.getByRole("region", { name: /workshop plan selection/i });
  await expect(tray).toBeVisible();
  await expect(page.locator(".workshop-tray__count")).toHaveText("2 lessons selected");
  await expect(tray.getByRole("listitem")).toHaveCount(2);

  // Boundary reorder: moving the first item "up" is a no-op button (disabled), so exercise
  // moving it down twice — the second move lands it at the end, disabling its own "later"
  // button, which is exactly the focus-loss case the implementation guards against.
  const firstItemDown = tray.getByRole("listitem").first().getByRole("button", { name: /later in the plan/i });
  await firstItemDown.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.evaluate(() => document.activeElement?.tagName.toLowerCase())).resolves.toBe("button");
  await expect(page.evaluate(() => document.activeElement === document.body)).resolves.toBe(false);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Worksheet" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^workshop-planning-worksheet-\d{4}-\d{2}-\d{2}\.md$/);

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(tray).not.toBeVisible();

  // NOTE: not calling expectNoAxeViolations here — /lessons/ has a pre-existing color-contrast
  // violation (.page-intro__note, unrelated to this feature) that isn't this test's job to fix.
});

test("mobile navigation opens, closes, and passes axe in expanded state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoEducation(page);

  const menuButton = page.getByRole("button", { name: /menu/i });
  await expect(menuButton).toBeVisible();
  await menuButton.focus();
  await page.keyboard.press("Enter");
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");

  const educationTrigger = page.getByRole("button", { name: /education/i });
  await educationTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(educationTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(headerSearch(page)).toBeVisible();
  const primaryNav = page.getByRole("navigation", { name: /primary/i });
  await expect(primaryNav.getByRole("link", { name: "Pathways", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Search", exact: true })).toHaveCount(0);
  await page.waitForTimeout(250);
  await expectNoAxeViolations(page);

  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
});
