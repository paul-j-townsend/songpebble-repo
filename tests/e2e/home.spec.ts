import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('renders the SongForm CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'SongPebble' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Create My Song/i })).toBeVisible()
  })
})
