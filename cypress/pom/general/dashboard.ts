export class Dashboard {
  orgPosition() {
    //erase
    cy.get('.sidebar-footer').should('have.text', '-1-cypress');
  }

  clickAdminButton() {
    cy.get('#header a').contains('Admin').click();
  }

  interceptSummary() {
    cy.intercept({
      method: 'GET',
      url: '/api/v2/organization/*/issue/summary?notcache=*' //TODO: improve this wait
    }).as('summary');
  }

  interceptGateway() {
    cy.intercept({
      method: 'POST',
      url: '    /api/v2/gateway'
    }).as('gateway');
  }

  markDefault(module: string) {
    cy.contains(module).click();
    cy.contains('Mark as default', { timeout: 5000 }).click();
  }
}

const createNewmodule = (name: string) => {
  cy.contains('MODULES').click();
  cy.contains('NEW MODULE').click();
  cy.contains('Select Module Type').parent().parent().parent().contains(name).click();
  cy.get('[type=submit]').click();
};

const orgPosition = () => {
  cy.get('#header').should('contain.text', ' -1-cypress ');
};

export { createNewmodule, orgPosition };
