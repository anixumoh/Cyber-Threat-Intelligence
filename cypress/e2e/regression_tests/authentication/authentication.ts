import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from 'pom/general/LoginPage.ts';

const loginPage = new LoginPage();

Given('I am in the login page', () => {
  cy.visit('/login');
});

Then('Username is empty', () => {
 
  loginPage.clearUsernameField();
});

Then('Password is empty', () => {
  loginPage.clearPasswordField();
});

When('the user types {string}', (Username: string) => {
  loginPage.enterUsername(Username);
});

When('the user enters {string}', (Password: string) => {
  loginPage.enterPassword(Password);
});

When('the user clicks on Login button', () => {
  loginPage.clickLoginButton();
});

Then('the user is redirected to {string}', (path: string) => {
  loginPage.verifyPathURL(path);
});
