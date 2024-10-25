// Feature: User should be able to change their name in the profile account tab

//     Scenario: User should be able to change their name in the profile account tab
//         Given credentials for user
//         When user logs in
//         And clicks on the profile in the top right corner
//         And clicks on Account Settings
//         And clicks on the profile tab
//         And should see the name field
//         And should see edit button
//         And clicks on the edit button
//         And should be able to edit the name field
//         And modifies the name field with a new name in this case the name in reverse
//         And clicks on the save button
//         Then should see the new name above the tabs

//given the description above, we can create the following test:
import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { UsersUtils } from 'pom/general/users_utils.ts';
import { LoginEntity } from 'support/entity.ts';
let user: LoginEntity;
let newUserName: string;

Given('credentials for user', () => {
  user = UsersUtils.getSmokeTestUser();
});
When('user logs in', () => {
  cy.login(user, 1000);
});
When('clicks on the profile in the top right corner', () => {
  cy.get('[data-test="profile"]').click();
});
When('clicks on Account Settings', () => {
  cy.get('[data-test="accountSettings"]').click();
});
When('clicks on the profile tab', () => {
  cy.wait(1000);
  cy.get('[data-test="profileAccordeon"]').click();
});
When('should see the name field', () => {
  cy.get('input[name="name"]').should('be.visible');
});
When('should see edit button', () => {
  cy.get('[data-test="editNameButton"]').should('be.visible');
});
When('clicks on the edit button', () => {
  cy.get('[data-test="editNameButton"]').click();
});
When('should be able to edit the name field', () => {
  cy.get('input[name="name"]').should('be.enabled');
});
When('modifies the name field with a new name in this case the name in reverse', () => {
  cy.get('input[name="name"]').then((input) => {
    const profileName = input.val().toString();
    newUserName = profileName.split('').reverse().join('');
    cy.get('input[name="name"]').clear().type(newUserName);
  });
});
When('clicks on the save button', () => {
  cy.intercept('PUT', '/api/v2/user/**', {
    fixture: 'user_profile/change_name/validResponse.json',
    statusCode: 200
  });
  cy.get('[data-test="saveNameButton"]').click();
});
Then('should see the new name above the tabs', () => {
  cy.get('[data-test="profileName"]').contains(newUserName).should('be.visible');
});
