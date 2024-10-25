class UsersPage {
  getUsersPageAPI() {
    cy.intercept('GET', 'api/v2/user/account?notcache=*', {
      statusCode: 200
    }).as('userAccount');

    cy.intercept('GET', '/api/v2/user/preferences?notcache=**', {
      fixture: 'users/preferences.json',
      statusCode: 200
    }).as('userPreferences');

    cy.intercept('GET', '/api/v2/user?*', {
      fixture: 'users/usersList.json',
      statusCode: 200
    }).as('getUsers');
  }

  getCreateOrEditUserAPIs() {
    cy.intercept('GET', '/api/v2/user/timezone?notcache=*', {
      fixture: 'users/timezone.json',
      statusCode: 200
    }).as('timezone');

    cy.intercept('GET', '/api/v2/user/groups?*', {
      fixture: 'users/userGroups.json',
      statusCode: 200
    }).as('groups');

    cy.intercept('GET', '/api/v2/organization?*', {
      fixture: 'organization/organizations.json',
      statusCode: 200
    }).as('organizations');

    let userId: string;
    cy.readFile('fixtures/users/userDetails.json').then((data) => {
      userId = data.id;
      cy.intercept('GET', `/api/v2/user/${userId}?notcache=*`, {
        fixture: 'users/userDetails.json',
        statusCode: 200
      }).as('getUserDetails');
    });

    cy.intercept('GET', '/api/v2/user/*/grant?*', {
      fixture: 'users/grant.json',
      statusCode: 200
    }).as('grant');

    cy.intercept('POST', '/api/v2/gateway?notcache=*', {
      fixture: 'users/customers.json',
      statusCode: 200
    }).as('gateway');
  }

  clickAddUserButton() {
    cy.get('.header-table-section div>button:nth-child(1)').click();
  }

  enterName(text: string) {
    cy.get('.row>div:nth-child(1) input[type="text"]').clear().type(text);
  }

  enterSurname(text: string) {
    cy.get('.row>div:nth-child(2) input[type="text"]').clear().type(text);
  }

  enterUsername(text: string) {
    cy.get('.row>div:nth-child(3) input[type="text"]').clear().type(text);
  }

  enterAddress(text: string) {
    cy.get('.row>div:nth-child(4) input[type="text"]').clear().type(text);
  }

  enterEmailAddress(text: string) {
    cy.get('.row>div input[type="email"]').clear().type(text);
  }

  enterPassword(text: string) {
    cy.get('.row>div input[type="password"]').clear().type(text);
  }

  enterPhoneNumber(phone: string) {
    cy.get('.row>div input[type="tel"]').clear().type(phone);
  }

  enterCompany(text: string) {
    cy.get('.row>div:nth-child(8) input[type="text"]').clear().type(text);
  }

  selectCustomer(text: string) {
    cy.intercept('POST', '/api/v2/gateway', {
      fixture: 'users/customers.json',
      statusCode: 200
    }).as('getCustomers');

    cy.get('input[type="undefined"]').clear().type(text);
    cy.wait('@getCustomers').its('response.statusCode').should('eq', 200);
    cy.get('.company-dropdown>li').eq(0).click();
  }

  selectTimeZone(timeZone: number) {
    cy.get('div>select:nth-child(2)').select(timeZone);
  }

  isAPIUser(value: number) {
    if (value == 1) {
      cy.get('input[type="checkbox"]:nth-child(2)').check();
    }
  }

  selectUserType(userType: number) {
    cy.get("input[type='radio']").eq(userType).check();
  }

  clickCreateUserButton() {
    cy.intercept('POST', '/api/v2/user', {
      statusCode: 200
    }).as('createUser');

    cy.get('div>.blue-bkg').click();
    cy.wait('@createUser').its('response.statusCode').should('eq', 200);
  }

  clickEditUserButton() {
    cy.intercept('PUT', '/api/v2/user/*', {
      statusCode: 200
    }).as('modifyUser');

    cy.intercept('PUT', '/api/v2/user/*/grant', {
      statusCode: 200
    }).as('updatedGrant');

    cy.get('div>.blue-bkg').click();
  }

  //Search for a user
  searchUser(text: string) {
    cy.intercept('GET', `/api/v2/user?notcache=*&p=true&maxRows=10&page=1&q=${text}&extraFields=true`, {
      fixture: 'users/searchedUser.json',
      statusCode: 200
    }).as('searchUser');
    cy.get('#search').clear().type(text);
    cy.wait('@searchUser').its('response.statusCode').should('eq', 200);
  }

  verifyUser(text: string) {
    cy.get('tr:nth-child(1)>td +td:nth-child(2)>span>a').then(($el) => {
      expect($el.text()).to.contain(text);
    });
  }

  clickDeleteIcon() {
    cy.get('tr:nth-child(1) .icon-delete').click();
  }

  confirmDelete() {
    cy.intercept('DELETE', `/api/v2/user/*`, {
      statusCode: 200
    }).as('deleteUser');
    cy.get('#modal-container div>button + button').click();
    cy.wait('@deleteUser').its('response.statusCode').should('eq', 200);
  }

  clickCheckBox() {
    cy.get("tr:nth-child(1)>td>span>input[type='checkbox']").check();
  }

  enableUser() {
    cy.get('app-action-circle:nth-child(3)>button').click();
  }

  disableUser() {
    cy.get('app-action-circle:nth-child(4)>button').click();
  }

  getUserStatus() {
    cy.intercept('PUT', `/api/v2/user/*/enable/*`, {
      statusCode: 200
    }).as('userStatus');
  }

  toggleUserStatus() {
    cy.get('tr:nth-child(1) act-switch:nth-child(1)').click();
  }

  assertUserStatus(status: string) {
    cy.readFile('cypress/fixtures/users/usersList.json').then((data) => {
      if (status === 'true') {
        data.list[0].status = 'ENABLED';
      } else if (status === 'false') {
        data.list[0].status = 'DISABLED';
      }
      cy.writeFile('cypress/fixtures/users/usersList.json', data);
    });

    cy.wait('@userStatus').then((request) => {
      cy.wrap(request).its('request.url').should('include', status);
      cy.wrap(request).its('response.statusCode').should('eq', 200);
    });
  }

  clickEditIcon() {
    cy.get('tr:nth-child(1)>td:nth-child(11) button').click();
  }
}
export default UsersPage;
