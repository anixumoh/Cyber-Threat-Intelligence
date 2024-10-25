import { LoginEntity } from './entity.ts';
import './custom_commands/NavigationCustom.ts';
import { UsersUtils } from 'pom/general/users_utils.ts';
import { spoofedRequests } from 'pom/helpers/spoofing/spoofedRequestsConfig.ts';
import { CypressTests } from 'pom/helpers/spoofing/cypressTests.ts';
import { ENDPOINTS } from 'pom/helpers/spoofing/endpoints.ts';
import { SpoofedRequestInfo } from 'pom/helpers/spoofing/spoofedRequestInfo.ts';

Cypress.Commands.add('addOrgByRequest', (body: Cypress.RequestBody | undefined) => {
  cy.request({
    method: 'POST',
    url: '/api/v2/auth',
    body: {
      username: UsersUtils.getSmokeTestUser().username,
      password: UsersUtils.getSmokeTestUser().password,
      code: '<string>'
    }
  })
    .its('body')
    .then((responToken) => {
      const header = {
        'x-cookie': responToken.token
      };
      cy.request({
        method: 'POST',
        url: '/api/v2/organization',
        headers: header,
        body: body
      });
    });
});

Cypress.Commands.add('interceptRequest', (spoofedRequest: SpoofedRequestInfo) => {
  const realEnd2End = Cypress.env('realEnd2End');
  if (!realEnd2End) {
    cy.intercept(
      {
        method: spoofedRequest.method,
        url: spoofedRequest.url
      },
      { fixture: spoofedRequest.fixture, statusCode: spoofedRequest.statusCode ? spoofedRequest.statusCode : 200 }
    ).as(spoofedRequest.alias);
  }
});

Cypress.Commands.add('callSpoofedRequestsForTestCase', (test, skipRequests = []) => {
  const requestsToLoop = spoofedRequests
    .filter((req) => !skipRequests.includes(req.endpoint))
    .filter((req) => req.cypressTests?.includes(test));

  requestsToLoop.forEach((req) => {
    console.log(`Calling spoofed request ${req.alias} for test ${test}`);
    cy.interceptRequest(req);
  });
});

Cypress.Commands.add('callSpecificSpoofedRequest', (endpoint: ENDPOINTS, overloadedFixture?: string) => {
  const req = spoofedRequests.find((req) => req.endpoint === endpoint);
  if (req) {
    if (overloadedFixture) {
      req.fixture = overloadedFixture;
    }
    cy.interceptRequest(req);
  }
});

Cypress.Commands.add('loginOrg', () => {
  cy.request({
    method: 'POST',
    url: '/api/v2/auth',
    body: {
      username: UsersUtils.getSmokeTestUser().username,
      password: UsersUtils.getSmokeTestUser().password,
      code: '<string>'
    }
  })
    .its('body')
    .then((responToken) => {
      const header = {
        'x-cookie': responToken.token
      };
      cy.intercept('/api/v2/**', (req) => {
        req.headers = header;
      })
        .as('under')
        .then(() => {
          cy.visit({
            method: 'GET',
            url: '/admin/orgs',
            headers: header
          });
        });
    });
});

Cypress.Commands.add('loginByRequest', ({ username, password }, urlValue) => {
  cy.request({
    method: 'POST',
    url: '/api/v2/auth',
    body: {
      username,
      password,
      code: '<string>'
    }
  })
    .its('body')
    .then((responToken) => {
      const header = {
        'x-cookie': responToken.token
      };
      cy.intercept('/api/v2/**', (req) => {
        req.headers = header;
      })
        .as('under')
        .then(() => {
          cy.visit({
            method: 'GET',
            url: urlValue,
            headers: header
          });
        });
    });
});

Cypress.Commands.add('login', (val: LoginEntity) => {
  cy.visit('/login');
  cy.wait(2000)
  cy.get('input[data-test="username"]').should('be.visible').type(val.username);
  cy.get('input[data-test="password"]').should('be.visible').type(val.password);
  cy.contains('Login').click();
});

//Used to generically click uniquely identified buttons
Cypress.Commands.add('clickButton', (buttonName) => {
  cy.contains('button', buttonName).should('be.visible').click();
  cy.wait(2000);
});

Cypress.Commands.add('clickSetFilter',()=>{
  cy.get('button.bx--btn--primary:visible').click();
})

Cypress.Commands.add('logout', () => {
  cy.get('button[data-test="profile"]').last().click({ force: true });
  cy.contains('button', 'Logout').click();
});

Cypress.Commands.add('closeModal', () => {
  cy.get('.is-visible button.bx--modal-close').click();
});

Cypress.Commands.add('goToOrganization', (orgName) => {
  cy.get('#organization').click();
  cy.get('#menu-organization').contains(orgName).click();
  cy.wait(3000);
});

Cypress.Commands.add('goToModule', (moduleType, index = 0) => {
  // Click expand modules if not already expanded
  cy.get('#sidebar-menu [data-test="MODULES"]').then(($menu) => {
    if (!$menu[0].nextElementSibling) {
      cy.get('#sidebar-menu [data-test="MODULES"]').click();
    }
  });

  cy.get(`#sidebar-menu [data-test="${moduleType}"]`).eq(index).click();

  cy.location('pathname').should('match', /dashboard\/organizations\/\d+\/modules\/\d+/);
});

Cypress.Commands.add('closeModal', () => {
  cy.get('.is-visible button.bx--modal-close').click();
});

Cypress.Commands.add('clickNavbarMenu', (menu: string) => {
  cy.get('div[data-test="top-navbar-items"] > a').contains(menu).click();
});

Cypress.Commands.add('assertToast', (text: string) => {
  cy.get("div[role='alert']").should('contain', text);
});

Cypress.Commands.add('assertURL', (text: string) => {
  cy.url().should('contain', text);
});

Cypress.Commands.add('verifyCurrentPage', (text: string) => {
  cy.get('h4').then(($el) => {
    expect($el).to.contain(text);
  });
});
