import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { ENDPOINTS } from 'pom/helpers/spoofing/endpoints.ts'

beforeEach(() => {
  cy.callSpoofedRequestsForTestCase('OrderFilters');
});
Given('Master User is logged in and is on the settings tab of a module and opened the filter section', () => {
  cy.visit('/login');
  cy.get('input[data-test="username"]').should('be.visible').type('ttt');
  cy.get('input[data-test="password"]').should('be.visible').type('qweQWE123###');
  cy.contains('Login').click();
  cy.url().should('contain', '/dashboard');
  cy.visit('dashboard/organizations/504/modules/2900/settings/filters');
});

When(
  'Master User clicks on reoder button of a row in the table and introduces a new position to another manually created filter',
  () => {
    cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
    cy.get('#settings-table')
      .should('be.visible')
      .then(() => {
        cy.scrollTo('center');
        cy.get('#settings-table').get('tbody').find('tr').eq(10).find('td').eq(6).find('button').click();
        cy.get('input[name="new-filter-order"]').type('9');
        cy.get('input[name="new-filter-order"]').type('{enter}');
      });
  }
);

Then('The correct order should be sent to the backend for Manually created filter', () => {
  cy.wait('@fakedReorderFilter').its('request.body').should('deep.equal', { order: 9 });
});

When(
  'Master User clicks on reoder button of a row in the table and introduces a new position to Automatically created filter',
  () => {
    cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
    cy.get('#settings-table')
      .should('be.visible')
      .then(() => {
        cy.scrollTo('center');
        cy.get('#settings-table').get('tbody').find('tr').eq(10).find('td').eq(6).find('button').click();
        cy.get('input[name="new-filter-order"]').type('5');
        cy.get('input[name="new-filter-order"]').type('{enter}');
      });
  }
);
Then('The correct order should be sent to the backend for Automatically created filter', () => {
  cy.wait('@fakedReorderFilter').its('request.body').should('deep.equal', { order: 4 });
});

Given('SuperAdmin User is logged in and is on the settings tab of a module and opened the filter section', () => {
  cy.callSpecificSpoofedRequest(ENDPOINTS.AUTH, 'common/fakedAccountSuperAdmin.json');
  cy.callSpecificSpoofedRequest(ENDPOINTS.ACCOUNT, 'common/fakedAccountSuperAdmin.json');
  cy.callSpecificSpoofedRequest(ENDPOINTS.ACCOUNT_ANGULAR, 'common/fakedAccountSuperAdmin.json');
  cy.visit('/login');
  cy.get('input[data-test="username"]').type('ttt');
  cy.get('input[data-test="password"]').type('qweQWE123###');
  cy.contains('Login').click();
  cy.url().should('contain', '/dashboard');
  cy.visit('dashboard/organizations/504/modules/2900/settings/filters');
});
When(
  'SuperAdmin User clicks on reoder button of a row in the table and introduces a new position to manually created filter',
  () => {
    cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
    cy.get('#settings-table')
      .should('be.visible')
      .then(() => {
        cy.scrollTo('center');
        cy.get('#settings-table').get('tbody').find('tr').eq(10).find('td').eq(6).find('button').click();
        cy.get('input[name="new-filter-order"]').type('9');
        cy.get('input[name="new-filter-order"]').type('{enter}');
      });
  }
);
Then('The correct order should be sent to the backend as SuperAdmin', () => {
  cy.wait('@fakedReorderFilter').its('request.body').should('deep.equal', { order: 9 });
});
When(
  'SuperAdmin User clicks on reoder button of a row in the table and introduces a new position to Automatically created filter',
  () => {
    cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
    cy.get('#settings-table')
      .should('be.visible')
      .then(() => {
        cy.scrollTo('center');
        cy.get('#settings-table').get('tbody').find('tr').eq(10).find('td').eq(6).find('button').click();
        cy.get('input[name="new-filter-order"]').type('5');
        cy.get('input[name="new-filter-order"]').type('{enter}');
      });
  }
);
Then('There should be an error message', () => {
  cy.get('.bx--inline-notification--error').should('be.visible');
});
Given('Normal User is logged in and is on the settings tab of a module and opened the filter section', () => {
  cy.callSpecificSpoofedRequest(ENDPOINTS.AUTH, 'common/fakedAccountAnalyst.json');
  cy.callSpecificSpoofedRequest(ENDPOINTS.ACCOUNT, 'common/fakedAccountAnalyst.json');
  cy.callSpecificSpoofedRequest(ENDPOINTS.ACCOUNT_ANGULAR, 'common/fakedAccountAnalyst.json');
  cy.visit('/login');
  cy.get('input[data-test="username"]').type('ttt');
  cy.get('input[data-test="password"]').type('qweQWE123###');
  cy.contains('Login').click();
  cy.url().should('contain', '/dashboard');
  cy.visit('dashboard/organizations/504/modules/2900/settings/filters');
});
When('Normal User clicks on reoder button of a row in the table and introduces a new position', () => {
  cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
  cy.get('#settings-table')
    .should('be.visible')
    .then(() => {
      cy.scrollTo('center');
      cy.get('#settings-table').get('tbody').find('tr').eq(10).find('td').eq(6).find('button').click();
      cy.get('input[name="new-filter-order"]').type('9');
      cy.get('input[name="new-filter-order"]').type('{enter}');
    });
});
Then('The correct order should be sent to the backend as NormalUser', () => {
  cy.wait('@fakedReorderFilter').its('request.body').should('deep.equal', { order: 9 });
});
