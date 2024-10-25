export class Hacktivism {
  addDuplicateRSS() {
    cy.get('.icon-plus').eq(4).click();
    cy.get('.form-control').clear().type('http://windowsinsider.mpsn.libsynpro.com/rss');
    cy.contains('Add').click();
  }

  clickHacktivismSettings() {
    cy.get(':nth-child(13) > .no-active > :nth-child(4) > .item-submenu')
      .find('.sidebar-submenu-row')
      .click({ force: true });
  }
}
const addPlatfromTechnologies = () => {
  cy.get('.icon-plus').eq(3).click();
  cy.get(':nth-child(2) > .mt-2').invoke('attr', 'placeholder').should('contain', 'Search for vendor');
  cy.get(':nth-child(2) > .mt-2').type('3');
  cy.get('.list-group-item > .text-90').eq(0).click({ force: true });
  cy.contains('Add').click();
};

const addRSS = (text: string) => {
  cy.get('app-hacktivism-rss > .settings-parameter').find('.icon-plus', { timeout: 5000 }).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const addTwitterUser = (text: string) => {
  cy.get('.row > :nth-child(6)').find('.icon-plus').click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

export { addPlatfromTechnologies, addRSS, addTwitterUser };
