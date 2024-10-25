export class DataLeakage {
  clickDataLeakageSettings() {
    cy.get(':nth-child(11) > .no-active > :nth-child(4) > .item-submenu')
      .find('.sidebar-submenu-row')
      .click({ force: true });
  }

  uncheckFileExtensionFilter() {
    cy.get('.bg-light.p-2').find('.form-check-input').eq(0).uncheck();
    cy.get('.bg-light.p-2').find('.form-check-input').eq(3).uncheck();
  }
}

const addConfidentialFilters = (text: string) => {
  cy.get('.icon-plus').eq(3).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const addDomain = (text: string) => {
  cy.get('.icon-plus').eq(1).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const addFilesName = (file: string) => {
  cy.get('.icon-plus').eq(2).click();
  cy.get('.form-control').clear().type(file);
  cy.contains('Add').click();
};

const addSearchWord = () => {
  cy.get('.icon-plus').eq(0).click();
  cy.get('.form-control').clear().type('covid{enter}');
  cy.get('.form-control').type('python');
  cy.contains('Add').click();
};

const checkFileExtensionFilter = () => {
  cy.get('.bg-light.p-2').find('.form-check-input').eq(0).check();
  cy.get('.bg-light.p-2').find('.form-check-input').eq(3).check();
};

export { addConfidentialFilters, addDomain, addFilesName, addSearchWord, checkFileExtensionFilter };
