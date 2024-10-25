export class Credentials {
  clickCredentialsSettings() {
    cy.get(':nth-child(7) > .no-active > :nth-child(4) > .item-submenu')
      .find('.sidebar-submenu-row')
      .click({ force: true });
  }

  runSearch() {
    cy.contains('Run Search').click();
    cy.contains('Back to list').click();
  }

  addMultipleEmail() {
    cy.get('.icon-plus').eq(2).click();
    cy.get('.form-control').clear().type('pepe@gmail.com{enter}');
    cy.get('.form-control').type('no-spam@hotmail.com');
    cy.contains('Add').click();
  }

  addBadEmail() {
    cy.get('.icon-plus').eq(2).click();
    cy.get('.form-control').clear().type('noemail.com');
    cy.contains('Add').click();
  }
}
const addEmail = (text: string) => {
  cy.get('.icon-plus').eq(2).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const clickCredentialsSettingsFirst = () => {
  cy.get(':nth-child(4) > .item-submenu > .select-submenu > .sidebar-submenu-row').click({ force: true });
};

export { addEmail, clickCredentialsSettingsFirst };
