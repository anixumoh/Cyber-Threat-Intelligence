class Navigation {
  clickOrganizationDropdown() {
    cy.get('#organization').click();
  }

  clickAnOrganization(str: string) {
    cy.get('#menu-organization>div>div').each(($el) => {
      if ($el.text().includes(str)) {
        cy.wrap($el).click();
      }
    });
  }

  //Select main module
  selectMainModule(moduleName: string) {
    cy.get('#sidebar-menu button div span.ml-3').each(($el) => {
      if ($el.text() === moduleName) {
        cy.wrap($el).click();
        cy.wait(1000);
      }
    });
  }

  //Select sub-module
  selectSubModule(subModuleName: string) {
    cy.get('div.py-1 div div.whitespace-nowrap').each(($el) => {
      if ($el.text() === subModuleName) {
        cy.wrap($el).click();
        cy.wait(7000);
      }
    });
  }

  selectSubModuleOption(optionName: string) {
    cy.get('a>.pl-10').each(($el) => {
      if ($el.text().includes(optionName)) {
        cy.wrap($el).click();
      }
    });
  }

  verifyPageName(str: string) {
    cy.get('.mt-2>h5').then(($el) => {
      expect($el).to.contain(str);
    });
  }
}
export default Navigation;
