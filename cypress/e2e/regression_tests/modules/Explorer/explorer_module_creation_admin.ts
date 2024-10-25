import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ENDPOINTS } from 'pom/helpers/spoofing/endpoints.ts';

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

When('the user clicks on the Admin panel', () => {
  cy.contains('Admin').click();
});

Then('the user clicks on the dropdown modules button of the first organization', () => {
  cy.callSpecificSpoofedRequest(ENDPOINTS.ORGANIZATION, 'common/fakedOrganizations_for_table.json');
  cy.get('table').get('tbody').find('tr').eq(3).find('td').eq(3).find('button').click();
});

Then('the user clicks on the New Module button', () => {
  cy.contains('New Module').click();
});

Then("a popup appears with buttons and one of them is called 'Explorer'", () => {
  cy.contains('button', 'Explorer').should('exist').click();
});
