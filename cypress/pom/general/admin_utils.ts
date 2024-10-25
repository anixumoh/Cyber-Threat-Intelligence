export class AdminUtils {
  static clickVersionButton(): void {
    cy.get('button[data-test="version-button"]').click();
  }

  static verifyFrontEndVersion(version: string): void {
    cy.get('[data-test="version"]').should('have.text', version);
  }
}
