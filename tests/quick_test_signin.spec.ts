
import { test, expect } from '@playwright/test'
//import { Loginpage } from '../pages/quicktest'
import * as dotenv from 'dotenv'
dotenv.config()
test('Test Case 1:Verify that user cannot sign in with invalid email and invalid password.', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', process.env.QUICK_USERNAME_INVALID!)
    await page.fill('[label="Password"]', process.env.QUICK_PASSWORD_INVALID!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('text=Email/Password mismatch. Try again')).toBeVisible()
})
test('Test Case 2:Verify that user should be able to login with valid username and password', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', process.env.QUICK_USERNAME!)
    await page.fill('[label="Password"]', process.env.QUICK_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(process.env.QUICK_DASHBOARD!)
})
test('Test Case 3:Verify that "Sign in" button should be visible and clickable', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})
test('Test Case 4:Verify that user cannot sign in with invalid email and valid password', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', process.env.QUICK_USERNAME_INVALID!)
    await page.fill('[label="Password"]', process.env.QUICK_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('text=Email/Password mismatch. Try again')).toBeVisible()
})
test('Test Case 5:Verify that user cannot sign in with valid email and invalid password', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', process.env.QUICK_USERNAME!)
    await page.fill('[label="Password"]', process.env.QUICK_PASSWORD_INVALID!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('text=Email/Password mismatch. Try again')).toBeVisible()
})
test('Test Case 6:Verify user cannot sign in with blank email and password', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', " ")
    await page.fill('[label="Password"]', " ")
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(process.env.WITHOUT_SIGNIN_URL!)
})
test('Test Case 7:Verify after clicking on remember me user should be able to login(in the new tab) without entering email and password even when tab is closed.', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', process.env.QUICK_USERNAME!)
    await page.fill('[label="Password"]', process.env.QUICK_PASSWORD!)
    await page.locator('[type="checkbox"]').click()
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(process.env.QUICK_DASHBOARD!)
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await expect(page).toHaveURL(process.env.QUICK_DASHBOARD!)
})
test('Test Case 8:Verify if new user logs in free trial pop up should be visible', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', process.env.QUICK_USERNAME!)
    await page.fill('[label="Password"]', process.env.QUICK_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(process.env.QUICK_DASHBOARD!)
    await expect(page.getByRole('heading', { name: 'Free Trial Period' })).toBeVisible()

})
test('Test Case 9:Verify that when a new user tries to sign in without signing up, the user is not logged in.', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', process.env.QUICK_NEW_EMAIL!)
    await page.fill('[label="Password"]', process.env.QUICK_NEW_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('text=Email/Password mismatch. Try again')).toBeVisible()
})
test('Test Case 10:Verify that if a user tries to enter invalid email format , an error should be visible on the ui.', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', "qwyopmail.com")
    await page.fill('[label="Password"]', process.env.QUICK_NEW_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('text=Email is not valid')).toBeVisible()
})
test('Test Case 11: Verify if password characters are less , error should be visible on the ui', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.fill('[label="Email Address"]', process.env.QUICK_NEW_EMAIL!)
    await page.fill('[label="Password"]', "passwor")
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('text=Password is too short')).toBeVisible()
})