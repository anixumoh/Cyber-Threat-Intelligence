import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { UsersUtils } from 'pom/general/users_utils.ts';
import { LoginEntity } from 'support/entity.ts';

let user: LoginEntity;

Given('the user is presented with a form with 3 password fields in ProfileAccount', () => {
  user = UsersUtils.getSmokeTestUser();
  cy.login(user);
  cy.visit('/profile/account');
});

When('the user clicks on the change password row', () => {
  cy.contains('Change password').click();
});

Then('the user enters the old password on the first input field', () => {
  cy.get('input[name="current"]').should('be.visible').type('qweQWE123!@#');
});

Then('the user enters a new password on the second input field', () => {
  cy.get('input[name="password"]').should('be.visible').type('asdASD123!@#');
});
Then('the user enters the same new password on the third input field', () => {
  cy.get('input[name="confirm"]').should('be.visible').type('asdASD123!@#');
});

Then('there are no errors in the form', () => {
  cy.wait(1000);
  cy.get('.invalid-icon').should('not.exist');
});

Then('user clicks on the submit button', () => {
  cy.intercept('PUT', '/api/v2/user/changepwd**', {
    fixture: 'password_change/validResponse.json'
  });

  cy.get('[data-test="changePasswordButton"]').click();
});

Then('the user should be presented with a feedback message saying that the password has been changed correctly', () => {
  cy.get('[data-test="notification"]').contains('Your account was updated successfully').should('be.visible');
});
