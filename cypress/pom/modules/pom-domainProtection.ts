export class DomainProtection {
  clickDomainProtectionSettings() {
    cy.get(':nth-child(12) > .no-active > :nth-child(4) > .item-submenu')
      .find('.sidebar-submenu-row')
      .click({ force: true });
  }

  verifyDuplicate(text: string) {
    for (let i = 1; i < 4; i++) {
      cy.get('.icon-plus').eq(i).click();
      cy.get('.form-control').clear().type('apple');
      cy.contains('Add').click();
      cy.get('.ng-trigger').find('.toast-title').should('have.text', text);
      cy.contains(text).click();
    } //typo by distance do not have treatment of duplicates
  }

  eraseFirst(selector: string, index: number) {
    for (let i = 0; i < index; i++) {
      cy.get(selector).eq(0).click({ force: true });
      cy.get('.modal-footer > .btn-primary').click();
    } //the last delete button do not have the same selector
    cy.get('.settings-parameter > .card-footer > .btn').click();
    cy.get('.modal-footer > .btn-primary').click();
  }

  verifyTermData(text: string) {
    cy.get('.icon-plus').eq(1).click();
    cy.get('.form-control').clear().type('@#$%^');
    cy.contains('Add').click();
    cy.get('.ng-trigger').find('.toast-title').should('have.text', text);
    cy.contains(text).click();
  }

  verifyTypoSimilarityData(text: string) {
    cy.get('.icon-plus').eq(3).click();
    cy.get('.form-control').clear().type('qa');
    cy.contains('Add').click();
    cy.get('.ng-trigger').find('.toast-title').should('have.text', text);
    cy.contains(text).click();
  }
}

const addTerms = () => {
  cy.get('.icon-plus').eq(1).click();
  cy.get('.form-control').clear().type('apple{enter}');
  cy.get('.form-control').type('iphone13{enter}');
  cy.get('.form-control').type('Iphone');
  cy.contains('Add').click();
};

const addTypoDistance = () => {
  cy.get('.icon-plus').eq(4).click();
  cy.get('.form-control').clear().type('apple{enter}');
  cy.get('.form-control').type('Iphone');
  cy.contains('Add').click();
};

const addTypoKeyword = () => {
  cy.get('.icon-plus').eq(2).click();
  cy.get('.form-control').clear().type('apple{enter}');
  cy.get('.form-control').type('iphone13{enter}');
  cy.get('.form-control').type('Iphone');
  cy.contains('Add').click();
};

const addTypoSimilarity = () => {
  cy.get('.icon-plus').eq(3).click();
  cy.get('.form-control').clear().type('apple{enter}');
  cy.get('.form-control').type('Iphone');
  cy.contains('Add').click();
};

export { addTerms, addTypoDistance, addTypoKeyword, addTypoSimilarity };
