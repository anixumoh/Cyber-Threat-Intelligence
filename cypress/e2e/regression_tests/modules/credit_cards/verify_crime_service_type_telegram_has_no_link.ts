import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ENDPOINTS } from 'pom/helpers/spoofing/endpoints.ts';

beforeEach(() => {
  cy.callSpoofedRequestsForTestCase('NoTelegramLinkInBankResouce');
});

Given('Any user logs in the web', () => {
  cy.visit('/login');
  cy.get('input[data-test="username"]').should('be.visible').type('ttt');
  cy.get('input[data-test="password"]').should('be.visible').type('qweQWE123###');
  cy.contains('Login').click();
  cy.url().should('contain', '/dashboard');
});

When('in the details of a credit card module resource', () => {
  cy.visit('/dashboard/organizations/504/modules/2912/resource/312051477');
  cy.scrollTo('bottom', { timeout: 50000 });
});

Then(
  'the user can see a table with a row with the Crime Service Type of telegram and verify that the telegram text is not a link',
  () => {
    cy.get('table')
      .contains('td', 'Telegram')
      .then((elem) => {
        //check that elem is not a link
        expect(elem.find('a').length).to.equal(0);
      });
  }
);
