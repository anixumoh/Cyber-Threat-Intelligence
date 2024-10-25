export class Container {
  showHideGraffic() {
    cy.get('text.amcharts-axis-label > tspan').should(($n) => {
      expect($n).to.have.not.equal(0);
    });
    cy.get('.icon-chart-bar').click();

    cy.get('.icon-chart-bar').click();
    cy.get('text.amcharts-axis-label > tspan').should(($n) => {
      expect($n).to.have.not.equal(0);
    });
  }
  clickInfoButton() {
    cy.wait(3000);
    cy.get('.icon-info', { timeout: 5000 }).click();
  }
  checkInfoButton(moduleInfo: string, moduleName: string, moduleText: string) {
    cy.get(moduleInfo).find('.info-header').should('have.text', moduleName);
    cy.get(moduleInfo).find('.info-body').should('have.text', moduleText);
    cy.get('.icon-times').click();
  }
  downloadGraphicPNG(selector: string) {
    cy.get("div[id='chartExport'] div:nth-child(2)", { timeout: 5000 }).should('be.visible').click(); //TODO: put a selector here
    cy.get(
      '.amcharts-export-menu.active > :nth-child(1) > .export-main > :nth-child(2) > :nth-child(1) > :nth-child(1)'
    ).click();
    cy.get(selector).should('have.text', 'PNG').click();
  }

  addMultipleDomain() {
    cy.get('.icon-plus').eq(0).click();
    cy.get('.form-control').clear().type('bbva.es{enter}');
    cy.get('.form-control').type('allianz.es');
    cy.contains('Add').click();
  }

  addMultipleIp() {
    cy.get('.icon-plus').eq(1).click();
    cy.get('.form-control').clear().type('195.235.25.0/24{enter}');
    cy.get('.form-control').type('203.55.142.15/32');
    cy.contains('Add').click();
  }

  eraseFirst(selector: string, index: number) {
    for (let i = 0; i < index; i++) {
      cy.get(selector).eq(0).click({ force: true });
      cy.get('.modal-footer > .btn-primary').click();
    }
  }

  checkToErase(items: number) {
    for (let i = 0; i < items; i++) {
      cy.get('.card-header > .form-check > .form-check-input').eq(i).check();
    }
  }
  searchSettings(criteria: string[]) {
    for (let i = 0; i < criteria.length; i++) {
      cy.get('.icon-search').eq(i).click();
      cy.get('.form-control').type(criteria[i]);
      cy.get('.settings-parameter').find('.card-body').eq(i).should('have.length', 1); //improve this assertion selector always have length ==1
      cy.get('.icon-search').eq(i).click();
    }
  }
  //Click alerts
  clickAlertsButton(user: string, email: string) {
    cy.get('.main-header-right > .btn-primary').click();
    cy.get('.mt-2 > .mb-0').should('have.text', "You haven't configured any alerts yet.");
    cy.get(':nth-child(1) > .btn > .ml-1').click();
    cy.get('.form-control').type(user);
    cy.contains(user).click();
    cy.contains('Add Email').click();
    cy.get('.form-control').type(email);
    cy.get('.input-group-append > .btn > #profileButton').click();
  }
  deleteUserAlerts() {
    cy.get('.height-header').should('have.text', 'Alerts');
    cy.get('.justify-content-between > .mt-1').should('have.text', 'Alert recipients');
    cy.get('thead > tr > :nth-child(1)').should('have.text', 'User');
    cy.get('thead > tr > :nth-child(2)').should('have.text', 'Email');
    cy.get('.th-text-center').should('have.text', 'Delete');
    cy.get(':nth-child(1) > .text-center > .btn > #profileButton').click();
    cy.get(':nth-child(2) > .text-center > .btn > #profileButton').click();
    cy.get('.mt-2 > .mb-0').should('have.text', "You haven't configured any alerts yet.");
  }

  addTerm(lens: number[], text: string) {
    cy.get('[tabindex=0]').eq(0).click();
    cy.contains('Add Term').click();
    cy.get('#searchPhrase').type(text);
    for (let i of lens) {
      cy.get('.icon-lens').eq(i).click();
    }
    cy.get('[type=submit]').click();
  }

  waitInfo() {
    cy.intercept({
      method: 'GET',
      url: '/api/v2/organization/*/module/*/resource/sources?notcache=*'
    }).as('waitInfo');
  }

  waitDelete() {
    cy.intercept({
      method: 'GET',
      url: '/api/v2/organization/*/module/*/dark_web/settings/alert?notcache=*'
    }).as('waitDelete');
  }
}

const addDomain = (text: string) => {
  cy.get('.icon-plus').eq(0).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const addIp = (text: string) => {
  cy.get('.icon-plus').eq(1).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const addSearchWord = (number: number, text: string) => {
  cy.get('.icon-plus').eq(number).click();
  cy.get('.form-control').clear().type(text);
  cy.contains('Add').click();
};

const assertItem = (num: number, val: string) => {
  cy.get('.card-body').find('.list-parameters > .list-group > .list-group-item').eq(num).should('have.text', val);
};

const locationPlaceholder = (path: string) => {
  cy.location('pathname').should('eq', path);
};

const pageto10 = () => {
  cy.get('[style="position: relative;"] > .btn').should('have.text', '50').click();
  cy.get('.list-group > :nth-child(1) > .mb-0').click();
  cy.get('[style="position: relative;"] > .btn').should('have.text', '10');
};

const pageto50 = () => {
  cy.get('[style="position: relative;"] > .btn').should('have.text', '10').click();
  cy.get(':nth-child(4) > .mb-0').click();
  cy.get('[style="position: relative;"] > .btn').should('have.text', '50');
};

const smokeuser = () => {
  return {
    username: Cypress.env('TC_SMOKE_TEST_USERNAME'),
    password: Cypress.env('TC_SMOKE_TEST_PASSWORD')
  };
};

const regressionUser = () => {
  return {
    username: Cypress.env('TC_SMOKE_TEST_USERNAME'),
    password: Cypress.env('TC_SMOKE_TEST_PASSWORD')
  };
};

const validateNotification = (text: string) => {
  cy.get('.ng-trigger').find('.toast-title').should('have.text', text);
  cy.contains(text).click();
};

export {
  addDomain,
  addIp,
  addSearchWord,
  assertItem,
  locationPlaceholder,
  pageto10,
  pageto50,
  smokeuser,
  regressionUser,
  validateNotification
};
