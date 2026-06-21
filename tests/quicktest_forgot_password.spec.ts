import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import 'dotenv/config'
import fs from 'fs'
dotenv.config()

test('Test Case 1:Verify that "Forgot password" link should be visible and clickable', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
})
test('Test Case 2:Verify that after clicking on "Forgot password?" link user should navigate to "Reset your password" screen', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
})
test.skip('Test Case 3:Verify that Password reset email should be sent to email address', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.fill('#email',process.env.QUICK_USERNAME!)
    await page.click('#forgot-password')
    await expect(page.getByText('Password reset email sent!')).toBeVisible()
    const context = page.context();
    const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click('#forgot-password'), 
  ])
    await newPage.waitForLoadState()
    await expect(newPage.locator('body')).toContainText('Hi Apurva, Someone requested a reset password')
})
test.skip('Test Case 4:Verify that after clicking on reset password link user should be redirected to "Setup your new password" screen', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.fill('#email',process.env.QUICK_USERNAME!)
    await page.click('#forgot-password')
    await expect(page.getByText('Password reset email sent!')).toBeVisible()
    const context = page.context();
    const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    await page.click('#forgot-password'), 
  ])
    await newPage.waitForLoadState()
    await expect(newPage.locator('body')).toContainText('Hi Apurva, Someone requested a reset password')
    await newPage.click('text=Click here to reset your password')
    await expect(newPage.locator('h1')).toContainText('Setup your new password')
})
test.skip('Test Case 5:Verify that user can change password', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.fill('#email',process.env.QUICK_USERNAME!)
    await page.click('#forgot-password')
    await expect(page.getByText('Password reset email sent!')).toBeVisible()
    const context = page.context();
    const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    await page.click('#forgot-password'), 
  ])
    await newPage.waitForLoadState()
    await expect(newPage.locator('body')).toContainText('Hi Apurva, Someone requested a reset password')
    await newPage.click('text=Click here to reset your password')
    await page.fill('#password',"3dex8vP7@@")
    await page.fill('#cnfpassword',"3dex8vP7@@")
    await page.click('#set-password')
    await expect(page.getByText('Password reset successfully')).toBeVisible()
})
test('Test Case 6:Verify that after clicking on quick test icon user should be redirected to sign in page', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.getByRole('img', { name: 'Workflow' }).click()
    await page.waitForURL(process.env.QUICK_TEST_BASE_URL!)

})
test.skip('Test Case 7:Verify when user clicks on quick test logo on set up new password screen it should be redirected to sign in page', async ({ page }) => {
   await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.pause()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.fill('#email',process.env.QUICK_USERNAME!)
    await page.click('#forgot-password')
    await expect(page.getByText('Password reset email sent!')).toBeVisible()
    const context = page.context();
    const [newPage] = await Promise.all([
    context.waitForEvent('page'),
   await page.click('#forgot-password'), 
  ])
    await newPage.waitForLoadState()
    await expect(newPage.locator('body')).toContainText('Hi Apurva, Someone requested a reset password')
    await newPage.click('text=Click here to reset your password')
    await page.click(".mx-auto h-12 w-auto")
    expect(page.waitForURL(process.env.QUICK_TEST_BASE_URL!))
})
test('Test Case 8:Verify when user clicks on back to login user should be redirected to sign in page', async ({ page }) => {
   await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.getByRole('link', { name: 'Back to Login' }).click()
})
test('Test Case 9: Verify Forgot password functionality when user enters invalid email address', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.waitForTimeout(5000)
    await page.fill('#email',process.env.QUICK_USERNAME_INVALID!)
    await page.getByRole('button', { name: 'Forgot Password' }).click()
    await expect(page.getByText('Record was not found. Try again.')).toBeVisible()

})
test('Test Case 10 : Verify Forgot password functionality by entering wrong email format', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.waitForTimeout(5000)
    await page.fill('#email',"apple@")
    await page.getByRole('button', { name: 'Forgot Password' }).click()
    await expect(page.getByText('Email is not valid')).toBeVisible()
})
test('Test Case 11: Verify Forgot password functionality by keeping the email field as blank', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD_URL!)
    await page.getByRole('button', { name: 'Forgot Password' }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
})
test.skip('Test Case 12: Verify that the forgot password link can be used only once and shows an error on reuse.', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!);
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!);
    await page.fill('#email', process.env.QUICK_USERNAME!);
    await page.click('#forgot-password');
    await expect(page.getByText('Password reset email sent!')).toBeVisible();
    const context = page.context();
    const [newPage] = await Promise.all([
    context.waitForEvent('page'),
   await  page.click('#forgot-password'),
]);
    await newPage.waitForLoadState();
    await expect(newPage.locator('body')).toContainText(
    'Hi Apurva, Someone requested a reset password'
    )
    await newPage.click('text=Click here to reset your password')
    await page.fill('#password', '3dex8vP7@@')
    await page.fill('#cnfpassword', '3dex8vP7@@')
    await page.click('#set-password')
    await newPage.click('text=Click here to reset your password')
    await page.waitForLoadState('domcontentloaded')
    await page.fill('#password', '3dex8vP7@@')
    await page.fill('#cnfpassword', '3dex8vP7@@')
    await page.click('#set-password')
    await expect(page.getByText('This link has expired or already been used')).toBeVisible()

})
test.skip('Test Case 13: Verify that user is able to login with the new password set ', async ({ page }) => {
     await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.waitForURL(process.env.QUICK_TEST_FORGOT_PASSWORD!)
    await page.fill('#email',process.env.QUICK_USERNAME!)
    await page.click('#forgot-password')
    await expect(page.getByText('Password reset email sent!')).toBeVisible()
    const context = page.context();
    const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click('#forgot-password'), 
  ])
    await newPage.waitForLoadState()
    await expect(newPage.locator('body')).toContainText('Hi Apurva, Someone requested a reset password')
    await newPage.click('text=Click here to reset your password')
    await page.fill('#password',"3dex8vP7@@")
    await page.fill('#cnfpassword',"3dex8vP7@@")
    await page.click('#set-password')
    await expect(page.getByText('Password reset successfully')).toBeVisible()
    await page.click(".mx-auto h-12 w-auto")
    expect(page.waitForURL(process.env.QUICK_TEST_BASE_URL!))
    await page.fill('[label="Email Address"]', process.env.QUICK_USERNAME!)
    await page.fill('[label="Password"]', process.env.QUICK_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(process.env.QUICK_DASHBOARD!)
})