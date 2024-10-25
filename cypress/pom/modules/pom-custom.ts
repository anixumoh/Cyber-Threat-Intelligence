export class Custom {
  checkInfoButton() {
    cy.get('.custom-info').find('.info-header').should('have.text', 'CUSTOM');
    cy.get('.icon-times').click();
  }

  clickCustomSettings() {
    cy.get(':nth-child(9) > .no-active > :nth-child(4) > .item-submenu')
      .find('.sidebar-submenu-row')
      .click({ force: true });
  }

  addDuplicateTerm(text: string) {
    cy.contains('Add Term').click();
    cy.get('#searchPhrase').type('pa mi casa');
    cy.get('[type=submit]').click();
    cy.get('.ng-trigger', { timeout: 10000 }).should('have.text', text);
    cy.contains(text).click();
  }

  deleteTerm() {
    cy.get(':nth-child(6) > .d-flex > .btn > .fa').click();
    cy.get('.modal-footer > .btn-primary').click();
  }

  searchTerm() {
    cy.get('[placeholder="Search for terms"]').type('casa');
    cy.get('tr.ng-star-inserted > :nth-child(2) > .mb-0').should('have.text', ' pa mi casa ');
    cy.get('[placeholder="Search for terms"]').clear();
    cy.contains('delivery').click();
  }

  detailEdit() {
    cy.get('.col-md-8 > .list-group > :nth-child(1)').should('have.text', 'Search Phrase: delivery ');
    cy.get('.card-header > :nth-child(2)', { timeout: 5000 }).click();
    cy.get('.icon-lens').eq(87).click();
    cy.get('.card.mb-2 > .card-footer > .btn').click();
  }
}
const addTerm = (text: string) => {
  cy.get('.nav > :nth-child(1)').click();
  cy.contains('Add Term').click();
  cy.get('#searchPhrase').type(text);
  cy.get('.icon-lens').eq(84).click();
  cy.get('.icon-lens').eq(85).click();
  cy.get('.icon-lens').eq(86).click();
  cy.get('.icon-lens').eq(87).click();
  cy.get('[type=submit]').click();
};

export { addTerm };
