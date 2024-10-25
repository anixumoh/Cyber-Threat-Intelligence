import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

beforeEach(() => {
  cy.callSpoofedRequestsForTestCase('ExplorerModuleCreation');
});

Given('A Master user logs in the web', () => {
  cy.visit('/login');
  cy.get('input[data-test="username"]').should('be.visible').type('ttt');
  cy.get('input[data-test="password"]').should('be.visible').type('qweQWE123###');
  cy.contains('Login').click();
  cy.url().should('contain', '/dashboard');
});

When('the user clicks on the MODULES dropdown', () => {
  cy.contains('MODULES').click();
});

Then('the user clicks on the "New Module" button', () => {
  cy.contains('a', 'NEW MODULE').should('exist').click();
});

Then('a <li> element with the text "Explorer" should be visible', () => {
  cy.contains('li', 'Explorer').should('exist');
});
