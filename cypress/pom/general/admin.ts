const jobsRefresh = (username = 'customercy') => {
  if (username == 'qa@blueliv.com' || username == 'mastercy') {
    cy.get('.list-group > :nth-child(7)').click();
    cy.contains('Refresh Jobs In Execution').click();
  } else {
    cy.get('.list-group').find('li').contains('Jobs', { matchCase: false }).should('not.exist');
  }
};

const adminRunSearch = () => {
  cy.get(':nth-child(1) > :nth-child(4) > .d-flex > app-action-circle > .bg-light', { timeout: 15000 }).click();
  cy.get('.col-md-3').last().find('.icon-mode_edit').click();
  cy.contains('Run Search').click();
  cy.wait(3000); //FIXME: Wait for the proper time
};

const waitEdit = () => {
  cy.intercept({
    method: 'GET',
    url: '/api/v2/organization?notcache=*&p=true&maxRows=10&s=true&page=1&o=name'
  }).as('orglist');
};

const editOrg = () => {
  cy.get('tbody > :nth-child(1) > :nth-child(6)').find('.cursor-pointer').click();
  cy.get('.form-group > .float-left').eq(0).uncheck();
  cy.get('.modal-body > :nth-child(2) > .btn').click();
  cy.get('.ng-trigger').find('.toast-title').should('have.text', ' Updated ');
  cy.contains('Updated').click();
  cy.get('.modal-header > .btn').click();
};

const deleteOrg = () => {
  cy.get('tbody > :nth-child(1) > :nth-child(7)').find('.cursor-pointer').click();
  cy.get('.modal-footer > .btn-primary').click();
};

const enableOrg = () => {
  cy.get('.btn-dark.ml-3').should('have.text', 'Back to Threat Compass');
  cy.get('.nav-item > .mb-0').should('have.text', 'Organizations');
  cy.get('.header-table-section > :nth-child(1) > :nth-child(1)').should('have.text', ' Add Organization ');
  cy.get('.header-table-section > :nth-child(1) > :nth-child(2)').should('have.text', ' Download settings ');
  cy.wait(3000); //FIXME: wait for list update and then the org enable
  cy.get(':nth-child(1) > .align-middle.td-60').click();
};

const searchItem = (text: string, result: string, location: string, placeholder: string, username: string) => {
  cy.get('#search').type(text);
  if (username == 'qa@blueliv.com') {
    cy.get(location).should('have.text', result);
    cy.get('#search').invoke('attr', 'placeholder').should('contain', placeholder);
  } else cy.get('.no-results').should('have.text', 'There are no resources');
};

const clickSideBarMenu = (li: string) => {
  cy.get(li).click();
};

const addUser = (username: string) => {
  cy.contains('Add user').click();
  if (username == 'qa@blueliv.com') {
    cy.get('.form-control').eq(8).click();
    cy.get('.form-control').eq(8).type('blu{enter}')
      .then(() => (startTime = new Date()));
    let startTime: Date = new Date();
    cy.wait('@gateway')
      .then((body) => {
        let endTime = new Date().getTime() - startTime.getTime();
        if (body && body.response) {
          expect(body.response.statusCode, 'STATUS CODE').to.eq(200);
          expect(endTime, 'REQUEST TIME').to.within(0, 15000);
          cy.log(`duration: ${endTime / 1000} seconds`);
        }
      })
      .then(() => cy.get('ul.company-dropdown').children().first().click());
  }
  cy.get('.form-control').eq(0).type('new');
  cy.get('.form-control').eq(1).type('user');
  cy.get('.form-control').eq(2).type('new-user');
  cy.get('.form-control')
    .eq(4)
    .type('new-user' + '@email.com');
  cy.get('.form-control').eq(5).type('Blueliv2021*');
  cy.get('[type="radio"]').first().check();
  cy.get('.modal-footer > .btn-primary').click();
  cy.wait('@user');
};

const editUser = (regressionUser: string, userToEdit: string) => {
  cy.get('#search').clear().type(userToEdit);
  cy.get('.align-middle.text-primary').should('have.text', ' new');
  cy.get('.mat-slide-toggle-bar').click();
  cy.wait(3000); //FIXME: Element detached from DOM
  if (regressionUser == 'admincy') {
    cy.get(':nth-child(10) > .d-flex > action-circle > .bg-light > .cursor-pointer').click();
    cy.get('.form-group > .float-left').eq(0).check();
  } else {
    cy.get(':nth-child(11) > .d-flex > app-action-circle > .bg-light > .cursor-pointer').click();
    cy.get('.form-group > .float-left').eq(0).check();
  }
  cy.get('[type=button]').eq(1).click();
  cy.wait(3000); //FIXME: Element detached from DOM
};

const deleteUser = () => {
  cy.get('.icon-delete').click();
  cy.get('.modal-footer > .btn-primary').click();
  cy.get('#search').clear();
};

export {
  addUser,
  adminRunSearch,
  clickSideBarMenu,
  deleteOrg,
  deleteUser,
  editOrg,
  editUser,
  enableOrg,
  jobsRefresh,
  searchItem
};
