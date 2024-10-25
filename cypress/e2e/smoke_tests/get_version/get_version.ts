import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { UsersUtils } from 'pom/general/users_utils.ts';
import { LoginEntity } from 'support/entity.ts';
import { AdminUtils } from 'pom/general/admin_utils.ts';

beforeEach(() => {
  cy.callSpoofedRequestsForTestCase('Version');
});
Given('an admin user is logged in', () => {
  let user: LoginEntity = UsersUtils.getSmokeTestUser();
  cy.login(user);
});

When('the user clicks on admin', () => {
  cy.clickNavbarMenu('Admin');
});

When('the user clicks on the version button', () => {
  AdminUtils.clickVersionButton();
});

Then('the user should be able to view the version', () => {
  const version: string = Cypress.env('CI_COMMIT_TAG')
    ? Cypress.env('CI_COMMIT_TAG')
    : Cypress.env('CI_COMMIT_BRANCH') || 'master';
  AdminUtils.verifyFrontEndVersion(version);
});
