import Navigation from '../../pom/general/Navigation.ts';

const navigation = new Navigation();

//Selects an organization in the navbar
Cypress.Commands.add('selectAnOrganization', (org: string) => {
  navigation.clickOrganizationDropdown();
  cy.wait(2000);
  navigation.clickAnOrganization(org);
});

//Clicks on the menu in the side bar
Cypress.Commands.add('clickMenu', (menu: string) => {
  navigation.selectMainModule(menu);
});

//Clicks on a module within the menu drop down if any
Cypress.Commands.add('clickSubMenu', (subMenu: string) => {
  navigation.selectSubModule(subMenu);
});

//Clicks on a option within the module drop down if any
Cypress.Commands.add('clickSubMenuOption', (optionName: string) => {
  navigation.selectSubModuleOption(optionName);
});

//Verifies the current page
Cypress.Commands.add('verifyCurrentPage', (str: string) => {
  navigation.verifyPageName(str);
});

//Use this to click a menu in the sidebar of the Admin section
Cypress.Commands.add('selectAdminMenu',(menu: string)=>
{
  cy.get('#admin-menu').contains(menu).click()
})
