export class MediaTracker {
  clickMediaTrackerSettings() {
    cy.get(':nth-child(15) > .no-active > :nth-child(4) > .item-submenu')
      .find('.sidebar-submenu-row')
      .click({ force: true });
  }

  unCheckRRSCategories() {
    cy.get('app-extra-categories > .settings-parameter').find('.form-check-input').eq(0).uncheck();
    cy.get('app-extra-categories > .settings-parameter').find('.form-check-input').eq(3).uncheck();
  }
}
const addRSS = (text: string) => {
  cy.get('.icon-plus').eq(1).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const addTwitterUser = (text: string) => {
  cy.get('.icon-plus').eq(2).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const checkRSSCategories = () => {
  cy.get('app-extra-categories > .settings-parameter').find('.form-check-input').eq(0).check();
  cy.get('app-extra-categories > .settings-parameter').find('.form-check-input').eq(3).check();
};

export { addRSS, addTwitterUser, checkRSSCategories };
