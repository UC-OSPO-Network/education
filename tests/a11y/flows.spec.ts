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
  await expect(page.getByRole("navigation", { name: /primary/i }).getByRole("link", { name: "All Lessons" })).toBeVisible();
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

  const search = page.getByLabel("Search");
  await search.focus();
  await expect(search).toBeFocused();
  await search.fill("git");

  await expect(count).not.toHaveText(initialCount || "");
  await expect(search).toBeFocused();

  await page.getByRole("button", { name: /clear filters/i }).first().click();
  await expect(count).toHaveText(initialCount || "");
  await expectNoAxeViolations(page);
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
  await expect(page.getByRole("link", { name: /browse pathways/i })).toBeVisible();
  await page.waitForTimeout(250);
  await expectNoAxeViolations(page);

  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
});
