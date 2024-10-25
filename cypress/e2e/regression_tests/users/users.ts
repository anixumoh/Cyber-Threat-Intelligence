import { After, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import UsersPage from 'pom/general/UsersPage.ts';
import { getRandomInt } from 'pom/helpers/number-generators.ts';
import { getRandomText } from 'pom/helpers/text-generators.ts';
import { UsersUtils } from 'pom/general/users_utils.ts';
import { LoginEntity } from 'support/entity.ts';

const usersPage = new UsersPage();

//Background
Given('user is logged in', () => {
  let user: LoginEntity = UsersUtils.getSmokeTestUser();
  cy.login(user);
});

When('user clicks on admin', () => {
  cy.clickNavbarMenu('Admin');
});

Then('user clicks on the users on the sidebar', () => {
  usersPage.getUsersPageAPI();
  cy.selectAdminMenu('USERS');
});

//Scenario: Admin a new user
When('admin clicks on the add user button', () => {
  usersPage.getCreateOrEditUserAPIs();
  usersPage.clickAddUserButton();
});

//This name would be used for the entire search and test process
const firstName: string = `name${getRandomText(5)}`;

When('admin enters the correct details of the users', () => {
  usersPage.enterName(firstName);
  usersPage.enterSurname(`surname${getRandomText(5)}`);
  usersPage.enterUsername(`un${getRandomText(5)}`);
  usersPage.enterAddress(`Address ${getRandomText(11)}`);
  usersPage.enterEmailAddress(`${getRandomText(5)}@maildrop.cc`);
  usersPage.enterPassword(`1@S${getRandomText(8)}`);
  usersPage.enterPhoneNumber(`01803343345`);
  usersPage.enterCompany(`Company${getRandomText(5)}`);
  usersPage.selectCustomer('Blu');

  //Adding 1 because the first value is "Select"
  usersPage.selectTimeZone(getRandomInt(3) + 1);
  usersPage.isAPIUser(getRandomInt(2));
  usersPage.selectUserType(getRandomInt(2));
});

When('user clicks on the create button to create a user', () => {
  usersPage.clickCreateUserButton();
});

//Scenario: Search for a user
When('user enter a valid first name in the search field', () => {
  usersPage.searchUser('Sample');
});

Then('user asserts for the user in the search list displayed', () => {
  usersPage.verifyUser('Sample');
});

//Scenario: Delete a user
When('user clicks on the delete icon', () => {
  usersPage.clickDeleteIcon();
});

Then('user clicks on the yes confirmation button', () => {
  usersPage.confirmDelete();
});

//Scenario: Disable a user by changing users status
When('admin clicks a users checkbox', () => {
  usersPage.clickCheckBox();
});

When('admin clicks on the red button to disable the users status', () => {
  usersPage.getUserStatus();
  usersPage.disableUser();
});

Then('user is disabled', () => {
  usersPage.assertUserStatus('false');
});

Then('admin clicks on the green button to enable the users status', () => {
  usersPage.getUserStatus();
  usersPage.enableUser();
});

Then('user is enabled', () => {
  usersPage.assertUserStatus('true');
});

//Scenario: Disable/Enable a user by clicking the toggle icon
When('user clicks on the toggle icon', () => {
  usersPage.getUserStatus();
  usersPage.toggleUserStatus();
});

//Scenario: Edit a users
When('user clicks on the edit option', () => {
  usersPage.getCreateOrEditUserAPIs();
  usersPage.clickEditIcon();
});

Then('user edits the required field', () => {
  usersPage.enterName(`name${getRandomText(5)}`);
  usersPage.enterSurname(`surname${getRandomText(5)}`);
  usersPage.enterUsername(`un${getRandomText(5)}`);
  usersPage.enterAddress(`Address ${getRandomText(11)}`);
  usersPage.enterEmailAddress(`${getRandomText(5)}@maildrop.cc`);
  usersPage.selectCustomer('Blu');
  usersPage.selectTimeZone(getRandomInt(3) + 1);
  usersPage.selectUserType(getRandomInt(2));
});

Then('user clicks on the save button', () => {
  usersPage.clickEditUserButton();
});

Then('user should be returned to the users page', () => {
  cy.verifyCurrentPage('Users');
});

After(function () {
  cy.logout();
});
