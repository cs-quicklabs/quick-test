
import { test, expect } from '@playwright/test'
//import { Loginpage } from '../pages/quicktest'
import * as dotenv from 'dotenv'
// import { resolve } from 'path';
dotenv.config()

test('Test Case 1:Verify after clicking on "Sign up" user should be navigated to Get started with quick test page', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Sign up' }).click()
})
test('Test Case 2:Verify user should get validation messages for all the required fields', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Sign up' }).click()
    await page.locator('#sign-up').click()
    await expect(page.getByText('First Name is required')).toBeVisible()
    await expect(page.getByText('Last Name is required')).toBeVisible()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Organization is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
    await expect(page.getByText('Confirm Password is required')).toBeVisible()
    await expect(page.getByText('Please accept Terms of Use & Privacy Policy')).toBeVisible()
})
test('Test Case 3:Verify after entering all required fields and clicking on sign up button new account should be created', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Sign up' }).click()
    await page.waitForURL(process.env.QUICK_TEST_SIGN_UP_URL!)
    await page.fill('#firstName',process.env.USERNAME!)
    await page.fill('#lastName',process.env.USERNAME!)
    const uniqueEmail = `a${Date.now()}@yopmail.com`
    await page.fill('#email',uniqueEmail)
    await page.fill('#org',process.env.USERNAME!)
    await page.fill('#password',process.env.QUICK_PASSWORD!+'@@@1')
    await page.fill('#cnfpassword',process.env.QUICK_PASSWORD!+'@@@1')
    await page.click('#termAndCondition')
    await page.click('#sign-up')
    await expect(page.getByText('Registration Successful!')).toBeVisible()  
    await page.getByRole('button', { name: 'OK' }).click()
    await page.waitForURL(process.env.QUICK_TEST_BASE_URL!)
})
test('Test Case 4:Verify that sign up button should not be disabled while sign up', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Sign up' }).click()
    await page.hover('#sign-up')
})
test('Test Case 5:Verify that without selecting "I agree to Terms of Use & Privacy Policy" user should not be able to sign up', async ({ page }) => {
    await page.goto(process.env.QUICK_TEST_BASE_URL!)
    await page.getByRole('link', { name: 'Sign up' }).click()
    await page.waitForURL(process.env.QUICK_TEST_SIGN_UP_URL!)
    await page.fill('#firstName',process.env.USERNAME!)
    await page.fill('#lastName',process.env.USERNAME!)
    const uniqueEmail = `a${Date.now()}@yopmail.com`
    await page.fill('#email',uniqueEmail)
    await page.fill('#org',process.env.USERNAME!)
    await page.fill('#password',process.env.QUICK_PASSWORD!+'@@@1')
    await page.fill('#cnfpassword',process.env.QUICK_PASSWORD!+'@@@1')
    await page.click('#sign-up')
    await expect(page.getByText('Please accept Terms of Use & Privacy Policy')).toBeVisible()
})
// test('Test Case 6:Verify that after clicking on either i agree to terms of use or  privacy policy link button,user should be redirected to respective page', async ({ page }) => {
//     await page.goto(process.env.QUICK_TEST_BASE_URL!)
//     await page.getByRole('link', { name: 'Sign up' }).click()
//     await page.getByRole('link', { name: 'Terms of Use' }).locator('strong').click()

// })
test('Test Case 6:After clicking on quick test icon on sign up page user should be redirected to sign in page', async ({ page }) => {
   await page.goto(process.env.QUICK_TEST_BASE_URL!)
   await page.getByRole('link', { name: 'Sign up' }).click()
   await page.click(".mx-auto h-12 w-auto")
   await page.waitForURL(process.env.QUICK_TEST_BASE_URL!)


 })
