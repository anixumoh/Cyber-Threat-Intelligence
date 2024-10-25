import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

beforeEach(() => {
  cy.callSpoofedRequestsForTestCase('ExpiredPassword');
});

Given('I am in the login page', () => {
  cy.visit('/login');
  cy.url().should('contain', '/login');
});
When('I enter my username', () => {
  cy.get('input[data-test="username"]').should('be.visible').type('ttt');
});
When('I enter my password', () => {
  cy.get('input[data-test="password"]').should('be.visible').type('qweQWE123###');
});
Then('I click login and should be presented with a feedback message and redirected to the expired page', () => {
  cy.contains('Login').click();
  cy.contains('Error').should('be.visible');
  cy.url().should('contain', '/expired-password');
});
