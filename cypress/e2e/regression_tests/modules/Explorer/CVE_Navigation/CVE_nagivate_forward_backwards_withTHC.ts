import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ENDPOINTS } from 'pom/helpers/spoofing/endpoints.ts';
let firstCVEName: string;
beforeEach(() => {
  cy.callSpoofedRequestsForTestCase('CVEDetailsNavigation');
});
Given('Any type of user is logged in the app and is in an organization with contracted THC', () => {
  cy.visit('/login');
  cy.get('input[data-test="username"]', { timeout: 30000 }).should('be.visible');
  cy.get('input[data-test="username"]').type('ttt');
  cy.get('input[data-test="password"]').type('qweQWE123###');
  cy.contains('Login').click();
  cy.url().should('contain', '/dashboard');
});
When('the user clicks on an Explorer module', () => {
  cy.goToModule('explorer');
});
Then('the user clicks on the first element in the list', () => {
  cy.get('#explorer-table').find('tbody').find('tr').eq(0).find('td').eq(1).find('a').click();
});
Then('the user is redirected to the CVEs details', () => {
  cy.get('button[data-test="next-cve-button"]').should('be.visible');
  cy.get('h4[data-test="cve-name"]')
    .should('be.visible')
    .invoke('text')
    .then((text) => {
      firstCVEName = text;
    });
});
Then('the user clicks on the next CVE button', () => {
  cy.callSpecificSpoofedRequest(ENDPOINTS.GATEWAY, 'modules/explorer/gateway2.json');
  cy.callSpecificSpoofedRequest(ENDPOINTS.APIGATEWAY, 'modules/explorer/gateway2.json');
  cy.get('button[data-test="next-cve-button"]').click();
});

Then('the user can see to the details of the next CVE and its not the same as the previous one', () => {
  cy.wait(250); //no other way to fix ui bug
  cy.get('h4[data-test="cve-name"]')
    .should('be.visible')
    .invoke('text')
    .then((text) => {
      expect(text).not.to.equal(firstCVEName);
    });
});
Then('the user clicks on the previous CVE button', () => {
  cy.callSpecificSpoofedRequest(ENDPOINTS.GATEWAY, 'modules/explorer/gateway.json');
  cy.callSpecificSpoofedRequest(ENDPOINTS.APIGATEWAY, 'modules/explorer/gateway.json');
  cy.get('button[data-test="previous-cve-button"]').click();
});
Then('the user can see the details of the first CVE', () => {
  cy.wait(250); //no other way to fix ui bug
  cy.get('h4[data-test="cve-name"]')
    .should('be.visible')
    .invoke('text')
    .then((text) => {
      expect(text).to.equal(firstCVEName);
    });
});

Then('the user clicks on the previous CVE button again', () => {
  cy.get('button[data-test="previous-cve-button"]').click();
});
Then('it should still display the first', () => {
  cy.get('h4[data-test="cve-name"]')
    .should('be.visible')
    .invoke('text')
    .then((text) => {
      expect(text).to.equal(firstCVEName);
    });
});
