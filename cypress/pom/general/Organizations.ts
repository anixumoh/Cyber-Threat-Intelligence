class Organizations {

  getOrganizations() {
    cy.intercept({
      method: 'GET',
      url: '/api/v2/organization?notcache=*&p=true&maxRows=10&s=true&o=name&page=1'
    },
      {
        fixture: 'organization/organizationsList.json',
        statusCode: 200
      }).as('organizations')
  }

  assertCurrentPage(pageName: string) {
    cy.wait('@organizations')
    cy.get('.nav-item>h5').then(($el) => {
      expect($el).to.have.text(pageName);
    });
  }

  getCountries() {
    cy.intercept({
      method: 'GET',
      url: '/api/v2/user/country?notcache=*'
    },
      {
        fixture: 'common/countries.json',
        statusCode: 200
      })
  }

  clickAddOrganizationBtn() {
    cy.get('.d-flex>button').contains('Organization').click();
  }

  enterOrganizationName(orgName: string) {
    cy.get("input[type='text']").eq(0).clear().type(orgName);
  }

  selectCustomer(customerName: string) {
    cy.intercept('POST', '/api/v2/gateway',
			{
				fixture: 'users/customers.json',
				statusCode: 200
			}).as('getCustomers')

		cy.get('input[type="undefined"]').clear().type(customerName)
		cy.wait('@getCustomers').its('response.statusCode').should('eq', 200)
		cy.get(".company-dropdown>li").eq(0).click()
  }

  enterTitle(title: string) {
    cy.get("input[type='text']").eq(1).clear().type(title);
  }

  enterFirstName(fName: string) {
    cy.get("input[type='text']").eq(2).clear().type(fName);
  }

  enterSurname(sName: string) {
    cy.get("input[type='text']").eq(3).clear().type(sName);
  }

  enterPhoneNumber(pNumber: string) {
    cy.get("input[type='text']").eq(4).clear().type(pNumber);
  }

  enterEmailAddress(email: string) {
    cy.get("input[type='text']")
      .eq(5)
      .clear()
      .type(email + '@maildrop.cc');
  }

  selectCountry(country: string) {
    cy.get('input-control select').select(country);
    cy.wait(2000);
  }

  clickNextButton() {
    cy.get('button[data-bv="next"]').click();
  }

  selectModule(module: number) {
    cy.get("button>h6").eq(module).click()
  }

  getModuleName(module: number) {
    cy.get("button>h6").eq(module).then($el => {
      let txt = $el.text()
      cy.wrap(txt).as('moduleText')
    })
  }

  clickOkayBtn() {
    cy.get('.card-footer>button:nth-child(1)').click();
  }

  clickAddNewModuleOption() {
    cy.get('button.float-right>span').click();
    cy.wait(3000);
  }

  searchOrganization(orgName: string) {
    cy.get('#search').clear().type(orgName);
    cy.wait(2000);
  }

  verifyOrganizationName(orgName: string) {
    cy.get('span>a').each(($el) => {
      if ($el.text().includes(orgName)) {
        cy.wrap($el)
          .should('be.visible')
          .and('have.text', ' ' + orgName + ' ');
      }
    });
  }

  clickModuleIcon(orgName: string) {
    cy.get('tr').each(($el) => {
      const text = $el.find('span>a').text();
      {
        if (text.includes(orgName)) {
          cy.wrap($el).find('i.icon-level-down').click();
        }
      }
    });
  }

  verifyCardModules() {
    cy.get('div.card-modules').should('be.visible');
  }

  clickEditIcon(orgName: string) {
    cy.get('tr').each(($el) => {
      const text = $el.find('span>a').text();
      {
        if (text.includes(orgName)) {
          cy.wrap($el).find('i.icon-mode_edit').click();
        }
      }
    });
  }

  clickAnOrganization(orgName: string) {
    cy.get('tr span>a').each(($el) => {
      {
        if ($el.text().includes(orgName)) {
          cy.wrap($el).click();
        }
      }
    });
  }

  clickDetailMenu(tabName: string) {
    cy.get('li>a.nav-link').each(($el) => {
      {
        if ($el.text().includes(tabName)) {
          cy.wrap($el).click();
        }
      }
    });
  }

  closeModal() {
    cy.get(".modal-header>button").click()
  }

  verifyOrganizationDetails() {
    cy.contains('Created').should('be.visible');
    cy.contains('First Name').should('be.visible');
  }

  deleteOrganization(orgName: string) {
    cy.get('tr').each(($el) => {
      const text = $el.find('span>a').text();
      {
        if (text.includes(orgName)) {
          cy.wrap($el).find('button>i.icon-delete').click();
        }
      }
    });
  }

  confirmDelete() {
    cy.get('.modal-footer > .btn-primary').click();
  }

  verifyDeletedOrganization(orgName: string) {
    cy.get('#search').clear().type(orgName);
    cy.contains(orgName).should('not.exist');
  }

  toggleOrganizationStatus(orgName: string) {
    cy.get('tr').each(($el) => {
      const text = $el.find('span>a').text();
      {
        if (text.includes(orgName)) {
          cy.wrap($el).find('div>.mat-slide-toggle').click();
        }
      }
    });
  }

  confirmSelectedStatus() {
    cy.get('.modal-footer>button:nth-child(2)').click();
  }

  verifyModuleStatus(stat: string) {
    cy.get('.card-modules [aria-checked]').invoke('attr', 'aria-checked').should('eq', stat);
  }

  verifyOrganizationStatus(stat: string) {
    cy.get('.checkbox-default [aria-checked]').invoke('attr', 'aria-checked').should('eq', stat);
  }

  clickSaveBtn() {
    cy.get('.modal-body button').click();
  }

  getExportOrganizationBtn() {
    return cy.get(".clearfix>button:nth-child(4)")
  }

  getImportModule() {
    return cy.get("input[type='file']")
  }

  getPopUpAlert() {
    return cy.get("#toast-container>div>div")
  }

  getNewModuleBtn() {
    return cy.get(".clearfix>button:nth-child(5)")
  }

  verifyModuleText() {
    cy.get('div>p>a').then($el => {
      cy.get('@moduleText').then($txt => {
        expect($el.text()).to.include($txt)
      })
    })
  }
}
export default Organizations;
