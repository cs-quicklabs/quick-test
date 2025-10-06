describe("Login test", function () {
  beforeEach(() => {
    cy.visit("/signin");
  });
  it("verifies all the elements in the login page", () => {
    cy.contains("label", "Email Address");
    cy.contains("label", "Password");
    cy.contains("label", "Remember Me");
    cy.contains("a", "Forgot password?").should(
      "have.attr",
      "href",
      "/forgot-password"
    );
    cy.get("#login-submit")
      .should("contain.text", "Sign in")
      .should("not.be.disabled");
  });

  it("should login with registered credentials ", () => {
    cy.loginGUI(Cypress.env("email"), Cypress.env("pwd"));
    cy.waitForPageLoad("/dashboard");
  });

  it("should not login with unregistered credentials ", () => {
    cy.loginGUI("abraham345@yopmail.com", "123456789");
    cy.contains("Invalid email or password. Please try again.");
  });

  it("verifies the blank field validation", () => {
    cy.get("[id=login-submit]").click();
    cy.contains("Email is required");
  });

  it("should not login with unregistered email id ", () => {
    cy.get("[name=email]").type("aban@yopmail.com");
    cy.get("[name=password]").type("12345678");
    cy.get("input[type=checkbox]").check();
    cy.get("[id=login-submit]").click();
    cy.contains("Invalid email or password. Please try again.");
  });

  it("verify to navigate to signup page from login page  ", () => {
    cy.get("a:contains(Sign up)").should("have.attr", "href", "/signup");
  });
});
