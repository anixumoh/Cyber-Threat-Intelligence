class LoginPage {
  clearUsernameField() {
    cy.get("input[name='username']").should('be.visible').and('be.empty');
  }

  clearPasswordField() {
    cy.get("input[name='password']").should('be.visible').and('be.empty');
    //This wait allows cypress enter username correctly
    cy.wait(2000);
  }

  enterUsername(str: string) {
    cy.get("input[name='username']").type(str);
  }

  enterPassword(str: string) {
    cy.get("input[name='password']").type(str);
  }

  clickLoginButton() {
    cy.get("button[type='submit']:nth-child(1)").click();
    //Wait time added to allow path load properly before path verification
    cy.wait(5000);
  }

  verifyPathURL(str: string) {
    cy.url().should('contain', str);
  }
}
export default LoginPage;
