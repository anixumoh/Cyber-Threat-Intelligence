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
When('Master User drag and drops a manually created filter to another manually created filter', () => {
  cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
  cy.get('#settings-table', { timeout: 15000 })
    .should('be.visible')
    .then(() => {
      cy.scrollTo('bottom');
      cy.get('#settings-table tbody tr').eq(7).as('rowToDrag');
      cy.get('@rowToDrag').trigger('mousedown', { force: true, which: 1 });
      cy.get('@rowToDrag')
        .invoke('position')
        .its('top')
        .then((y) => {
          cy.get('@rowToDrag')
            .trigger('mousemove', { force: true, clientY: y + 100 })
            .wait(500)
            .trigger('mouseup', { force: true });
        });
    });
});
Then('The correct order should be sent to the backend for Manually created filter', () => {
  cy.wait('@fakedReorderFilter').its('request.body').should('deep.equal', { order: 9 });
});
When('Master User drag and drops a manually created filter over Automatically created filter', () => {
  cy.url().should('include', '/dashboard/organizations/504/modules/2900/settings/filters');
  cy.get('#settings-table', { timeout: 15000 })
    .should('be.visible')
    .then(() => {
      cy.scrollTo('bottom');
      cy.get('#settings-table tbody tr').eq(7).as('rowToDrag');
      cy.get('@rowToDrag').trigger('mousedown', { force: true, which: 1 });
      cy.get('@rowToDrag')
        .invoke('position')
        .its('top')
        .then((y) => {
          cy.get('@rowToDrag')
            .trigger('mousemove', { force: true, clientY: y - 100 })
            .wait(500)
            .trigger('mouseup', { force: true });
        });
    });
});
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
When('SuperAdmin User drag and drops a manually created filter to another manually created filter', () => {
  cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
  cy.get('#settings-table', { timeout: 15000 })
    .should('be.visible')
    .then(() => {
      cy.scrollTo('bottom');
      cy.get('#settings-table tbody tr').eq(7).as('rowToDrag');
      cy.get('@rowToDrag').trigger('mousedown', { force: true, which: 1 });
      cy.get('@rowToDrag')
        .invoke('position')
        .its('top')
        .then((y) => {
          cy.get('@rowToDrag')
            .trigger('mousemove', { force: true, clientY: y + 100 })
            .wait(500)
            .trigger('mouseup', { force: true });
        });
    });
});
Then('The correct order should be sent to the backend as SuperAdmin', () => {
  cy.wait('@fakedReorderFilter').its('request.body').should('deep.equal', { order: 9 });
});
When('SuperAdmin User drag and drops a manually created filter to Automatically created filter', () => {
  cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
  cy.get('#settings-table', { timeout: 15000 })
    .should('be.visible')
    .then(() => {
      cy.scrollTo('bottom');
      cy.get('#settings-table tbody tr').eq(7).as('rowToDrag');
      cy.get('@rowToDrag').trigger('mousedown', { force: true, which: 1 });
      cy.get('@rowToDrag')
        .invoke('position')
        .its('top')
        .then((y) => {
          cy.get('@rowToDrag')
            .trigger('mousemove', { force: true, clientY: y - 100 })
            .wait(500)
            .trigger('mouseup', { force: true });
        });
    });
});
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
When('Normal User drag and drops a manually created filter to another manually created filter', () => {
  cy.url().should('contain', '/dashboard/organizations/504/modules/2900/settings/filters');
  cy.get('#settings-table', { timeout: 15000 })
    .should('be.visible')
    .then(() => {
      cy.scrollTo('bottom');
      cy.get('#settings-table tbody tr').eq(7).as('rowToDrag');
      cy.get('@rowToDrag').trigger('mousedown', { force: true, which: 1 });
      cy.get('@rowToDrag')
        .invoke('position')
        .its('top')
        .then((y) => {
          cy.get('@rowToDrag')
            .trigger('mousemove', { force: true, clientY: y + 100 })
            .wait(500)
            .trigger('mouseup', { force: true });
        });
    });
});
Then('The correct order should be sent to the backend as NormalUser', () => {
  cy.wait('@fakedReorderFilter').its('request.body').should('deep.equal', { order: 9 });
});
