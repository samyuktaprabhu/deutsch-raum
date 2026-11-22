import { test, expect } from '@playwright/test'

test('application opens and presents an account or setup screen', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText(/Welcome back|Willkommen zurück|Deutschraum setup|Deutschraum-Einrichtung/i)
})

test('learner can open a lesson and use the German audio controls', async ({ page }) => {
  test.skip(!process.env.E2E_USER_EMAIL || !process.env.E2E_USER_PASSWORD, 'Set E2E_USER_EMAIL and E2E_USER_PASSWORD repository secrets to enable authenticated classroom checks')
  await page.goto('/')
  await page.getByLabel(/E-Mail-Adresse/i).fill(process.env.E2E_USER_EMAIL)
  await page.getByLabel(/Passwort/i).fill(process.env.E2E_USER_PASSWORD)
  await page.getByRole('button', { name: /Anmelden/i }).click()
  await expect(page.getByText(/Kursplan/i)).toBeVisible({ timeout: 30000 })
  await page.getByRole('button', { name: /Einheit öffnen/i }).first().click()
  await expect(page.getByRole('heading', { name: /Hören/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Pause/i })).toBeDisabled()
  await expect(page.getByRole('button', { name: /Stopp/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Auf Englisch übersetzen/i }).first()).toBeVisible()
})
