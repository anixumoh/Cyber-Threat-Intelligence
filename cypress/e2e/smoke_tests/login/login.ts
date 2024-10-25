import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { LoginEntity } from 'support/entity.ts';
import { UsersUtils } from 'pom/general/users_utils.ts';

let user: LoginEntity;

Given('a valid user', () => {
  user = UsersUtils.getSmokeTestUser();
});

When('the user logs in', () => {
  let user: LoginEntity = UsersUtils.getSmokeTestUser();
  cy.login(user);
});

Then('the user should be taken to the home page', () => {
  cy.url().should('contain', 'dashboard/organizations');
});
