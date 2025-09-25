import { Page, Locator } from '@playwright/test'
export class Loginpage {
    readonly page: Page
    readonly username: Locator
    readonly password: Locator
    readonly submit: Locator
    constructor(page: Page) {
        this.page = page;
        this.username = page.locator('[label="Email Address"]')
        this.password = page.locator('[label="Password"]')
        this.submit = page.locator('#login-submit')
    }
    async login(username: string, password: string) {
        await this.username.fill(username)
        await this.password.fill(password)
        await this.submit.click()
        
    }
}
