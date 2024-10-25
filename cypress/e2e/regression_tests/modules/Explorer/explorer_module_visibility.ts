import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('A master user is logged in and is at the dashboard', () => {
  cy.visit('/login');
  cy.get('input[data-test="username"]').should('be.visible').type('ttt');
  cy.get('input[data-test="password"]').should('be.visible').type('qweQWE123###');
  cy.contains('Login').click();
  cy.url().should('contain', '/dashboard');
});

Then('the menu element named {string} should not be visible', (element: string) => {
  cy.get(`${element}`).should('not.exist');
});

When('the user clicks on the Modules dropdown', () => {
  cy.contains('MODULES').click();
});

Then('the {string} module should exist in the list', (element: string) => {
  cy.get(`a[data-test="${element}"]`).should('exist');
});
