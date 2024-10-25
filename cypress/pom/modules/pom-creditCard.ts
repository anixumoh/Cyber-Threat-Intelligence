export class CreditCard {
  clickCreditCardSettings() {
    cy.get(':nth-child(8) > .no-active > :nth-child(4) > .item-submenu')
      .find('.sidebar-submenu-row')
      .click({ force: true });
  }

  deleteMultiple() {
    cy.get('.card-header > .form-check > .form-check-input').check();
    cy.get('.delete').click();
    cy.get('.modal-footer > .btn-primary').click();
    cy.get('.card-header > :nth-child(1) > .form-check > .form-check-input').check();
    cy.get('app-bank > .settings-parameter > .card-footer > .btn').click();
    cy.get('.modal-footer > .btn-primary').click();
  }

  addMultipleBank() {
    cy.contains('Add Bank').click();
    cy.get('[type=text]').eq(0).type('My Bank');
    cy.get('[type=text]').eq(1).type('435791');
    cy.contains('Add binCodes').click();
    cy.contains('Apply').click();

    cy.contains('Add Bank').click();
    cy.get('[type=text]').eq(0).type('New Bank');
    cy.get('[type=text]').eq(1).type('300619,303602');
    cy.contains('Add binCodes').click();
    cy.contains('Apply').click();
  }

  addMultipleCreditCard() {
    cy.get('.icon-plus').click();
    cy.get('.form-control').clear().type('86e5bbc210937a00934c3c5c62bff28d{enter}');
    cy.get('.form-control').type('9425990917fba00b81de7f598f33cb39');
    cy.get('.p-2 > .btn').click();
  }

  addDuplicateCreditCard() {
    cy.get('.icon-plus').click();
    cy.get('.form-control').type('86e5bbc210937a00934c3c5c62bff28d');
    cy.get('.bg-light.p-2').find('.btn').click();
  }

  addDuplicateBincode() {
    cy.get('.icon-plus-circle-solid').eq(1).click();
    cy.get('.form-control').type('435791');
    cy.contains('Add binCodes').click();
    cy.get('.icon-times').click();
  }

  addBadBank() {
    cy.contains('Add Bank').click();
    cy.get('[type=text]').eq(0).type('My Bank');
    cy.get('[type=text]').eq(1).type('4984');
    cy.contains('Add binCodes').click();
    cy.get('.icon-times').click();
  }

  clickAlertsButton(user: string, email: string) {
    cy.get('.main-header-right > .btn-primary').click();
    cy.get('.aside-container > .card-body').find('.form-check-input').eq(0).check();
    cy.get('.aside-container > .card-body').find('.form-check-input').eq(1).check();
    cy.get('.mt-2 > .mb-0').should('have.text', "You haven't configured any alerts yet.");
    cy.get(':nth-child(1) > .btn > .ml-1').click();
    cy.get('.form-control').type(user);
    cy.contains(user).click();
    cy.contains('Add Email').click();
    cy.get('.form-control').type(email);
    cy.get('.input-group-append > .btn > #profileButton').click();
  }

  deleteUserAlerts() {
    cy.get('.height-header').should('have.text', 'Feeds');
    cy.get('.justify-content-between > .mt-1').should('have.text', 'Alert recipients');
    cy.get('thead > tr > :nth-child(1)').should('have.text', 'User');
    cy.get('thead > tr > :nth-child(2)').should('have.text', 'Email');
    cy.get('.th-text-center').should('have.text', 'Delete');
    cy.get(':nth-child(1) > .text-center > .btn > #profileButton').click();
    cy.get(':nth-child(2) > .text-center > .btn > #profileButton').click();
    cy.get('.mt-2 > .mb-0').should('have.text', "You haven't configured any alerts yet.");
  }
}
const addBank = () => {
  cy.contains('Add Bank').click();
  cy.get('[type=text]').eq(0).type('My Bank');
  cy.get('[type=text]').eq(1).type('435791');
  cy.contains('Add binCodes').click();
  cy.contains('Apply').click();
};

const addCreditCard = () => {
  cy.get('.icon-plus').click();
  cy.get('.form-control').type('86e5bbc210937a00934c3c5c62bff28d');
  cy.get('.btn.btn-primary.btn-sm.px-4.float-right').click();
};

export { addBank, addCreditCard };
