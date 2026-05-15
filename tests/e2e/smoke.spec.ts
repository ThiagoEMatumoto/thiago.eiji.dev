import { test, expect } from '@playwright/test'

/**
 * Smoke tests for the landing page.
 *
 * Goals:
 *  - Both locales render the hero statement (typewriter writes the final string
 *    eventually; we wait for it via aria-label which holds the full string for
 *    screen readers).
 *  - Lang toggle navigates between PT and EN.
 *  - Contact links carry valid hrefs.
 *  - Mobile baseline (375x667) does not break layout (no horizontal scroll).
 */

const heroH1 = (page: import('@playwright/test').Page) =>
  page.locator('section[aria-label="hero"] h1')

test.describe('landing smoke', () => {
  test('PT (/) renders the hero statement', async ({ page }) => {
    await page.goto('/')
    const heading = heroH1(page)
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Construo produtos', {
      timeout: 10_000,
    })
  })

  test('EN (/en/) renders the hero statement', async ({ page }) => {
    await page.goto('/en/')
    const heading = heroH1(page)
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('I build products', { timeout: 10_000 })
  })

  test('lang toggle navigates PT ↔ EN', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'EN', exact: true }).click()
    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    await page.getByRole('link', { name: 'PT', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt')
  })

  test('contact section has valid email/github/linkedin links', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator('#contact').scrollIntoViewIfNeeded()

    const contactLinks = page.locator('#contact a')
    await expect(
      contactLinks.filter({ hasText: 'thiagoeijimatumoto@gmail.com' }),
    ).toHaveAttribute('href', /^mailto:thiagoeijimatumoto@gmail\.com$/)
    await expect(
      contactLinks.filter({ hasText: '@ThiagoEMatumoto' }),
    ).toHaveAttribute('href', 'https://github.com/ThiagoEMatumoto')
    await expect(
      contactLinks.filter({ hasText: 'thiago-eiji-matumoto' }),
    ).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/thiago-eiji-matumoto/',
    )
  })

  test('components lab section renders in PT and EN', async ({ page }) => {
    await page.goto('/')
    const labPt = page.locator('#components-lab')
    await labPt.scrollIntoViewIfNeeded()
    await expect(labPt).toBeVisible()
    await expect(labPt.locator('.lab-card')).toHaveCount(9)

    await page.goto('/en/')
    const labEn = page.locator('#components-lab')
    await labEn.scrollIntoViewIfNeeded()
    await expect(labEn).toBeVisible()
    await expect(labEn.locator('.lab-card')).toHaveCount(9)
    await expect(labEn).toContainText('9 components, all live')
  })

  test('stack and how-i-work render as cards (PT + EN)', async ({ page }) => {
    await page.goto('/')
    const stackPt = page.locator('#stack')
    await stackPt.scrollIntoViewIfNeeded()
    await expect(stackPt.locator('.stack-card')).toHaveCount(12)
    await expect(stackPt).toContainText('desde 2021')

    const howPt = page.locator('#how-i-work')
    await howPt.scrollIntoViewIfNeeded()
    await expect(howPt.locator('.principle-card')).toHaveCount(5)

    await page.goto('/en/')
    const stackEn = page.locator('#stack')
    await stackEn.scrollIntoViewIfNeeded()
    await expect(stackEn.locator('.stack-card')).toHaveCount(12)
    await expect(stackEn).toContainText('since 2021')

    const howEn = page.locator('#how-i-work')
    await howEn.scrollIntoViewIfNeeded()
    await expect(howEn.locator('.principle-card')).toHaveCount(5)
  })

  test('mobile baseline (375x667) — no horizontal overflow', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    })
    const page = await context.newPage()
    await page.goto('/')
    await expect(heroH1(page)).toBeVisible()

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)

    await context.close()
  })
})
