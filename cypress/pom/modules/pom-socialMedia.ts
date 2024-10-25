export class SocialMedia {
  clickSocialMediaSettings() {
    cy.get(':nth-child(17) > .no-active > :nth-child(5) > .item-submenu')
      .find('.sidebar-submenu-row')
      .click({ force: true });
  }
  interceptFilter() {
    cy.intercept({
      method: 'GET',
      url: '/api/v2/filter/global?notcache=*'
    }).as('filter');
  }

  interceptOrg() {
    cy.intercept({
      url: '/api/v2/organization*'
    }).as('org');
  }

  searchTerm() {
    cy.get(':nth-child(5) > .float-left').type('pple');
    cy.get('tr > :nth-child(2) > .mb-0').should('have.text', ' apple ');
    cy.get(':nth-child(5) > .float-left').clear();
    cy.get('tbody > :nth-child(1) > :nth-child(2)').should('have.text', ' apple ');
  }

  detailEdit() {
    cy.contains('Iphone').click();
    cy.get('.col-md-8 > .list-group > :nth-child(1)').should('have.text', 'Search Phrase: Iphone ');
    cy.get('.card-header > :nth-child(2)', { timeout: 5000 }).click();
    cy.get('#searchTwitter').check();
    cy.get('.icon-lens').eq(87).click();
    cy.get('.card.mb-2 > .card-footer > .btn').click();
    cy.wait('@org');
    cy.get('.card.mb-2 > :nth-child(1) > .btn-light').click();
    cy.contains('Iphone').click();
  }
}

const addSearchPhrase = (text: string) => {
  cy.contains('Terms').click();
  cy.contains('Add Search Phrase').click();
  cy.get('.form-control').type(text);
  cy.contains('Create').click();
};
export { addSearchPhrase };
