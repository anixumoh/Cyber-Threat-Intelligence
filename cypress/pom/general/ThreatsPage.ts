import { getRandomInt } from '../helpers/number-generators.ts';

class ThreatsPage {
  selectThreat(totalThreats: number) {
    cy.get('td input[type="checkbox"]').then(($el) => {
      for (let i = 0; i < $el.length; i++) {
        if (i == totalThreats) {
          break;
        }
        cy.wrap($el).eq(i).click({ force: true });
      }
    });
  }

  clickActions() {
    cy.get('.btn-group.self-start').click();
  }

  //Click Mark as Read
  clickMarkAsRead() {
    cy.get(".bx--action-list>button[title='Mark as Read']").click();
  }

  clickMarkAsUnread() {
    cy.get(".bx--action-list>button[title='Mark as Unread']").click();
  }

  //Decommissioned
  clickOnAnOption(option: string) {
    cy.get('.btn-group>div>.bx--popover-contents>ul>li>.ml-2').each(($el) => {
      if ($el.text().includes(option)) {
        cy.wrap($el).click();
      }
    });
  }

  //Only used for single resource delete
  confirmAction() {
    cy.get('.is-visible .mt-3 button').each(($el) => {
      if ($el.text().includes('Delete')) {
        cy.wrap($el).click();
      }
    });
  }

  clickAddResourceButton() {
    cy.get('.mt-14>button').click();
  }

  clickPrimaryBtn() {
    cy.get('.is-visible button.bx--btn').eq(1).click();
  }

  verifySuccessMessage() {
    cy.get('.bx--inline-notification__title').should('be.visible').contains('succesfully');
  }

  enterURL(url: string) {
    cy.get('#url').clear().type(url);
  }

  getClassificationValues() {
    return cy.get('.is-visible div>select>option');
  }

  selectClassification(selectedOption: string) {
    cy.get('.is-visible select').select(selectedOption);
  }

  //Clicks on a resource in the Threats page
  clickOnThreat(i: number) {
    cy.get('.items-center>a>div>div:nth-child(1)')
      .eq(i - 1) //Based on the index value, minus 1 to get actual element position
      .click({ force: true });
  }

  verifyThreatDetailPage() {
    cy.get('.mt-14>div>h4').should('be.visible');
  }

  //Can be used to click on any button on the resource screen
  clickButtonInResource(str: string) {
    cy.get('.p-2>div>button>span').each(($el) => {
      if ($el.text().includes(str)) {
        cy.wrap($el).click({ force: true });
      }
    });
  }

  verifyMarkAs(str: string) {
    cy.get('.p-2>div>button>span').each(($el) => {
      if ($el.text().includes(str)) {
        cy.wrap($el).parent().should('have.class', 'bg-ctip-primary');
      }
    });
  }

  verifyBtnPresence(str: string) {
    cy.get('.p-2>div>button>span').each(($el) => {
      if ($el.text().includes(str)) {
        cy.wrap($el).should('be.visible');
      }
    });
  }

  verifyUnmarkAs(str: string) {
    cy.get('.p-2>div>button>span').each(($el) => {
      if ($el.text().includes(str)) {
        cy.wrap($el).parent().should('not.have.class', 'bg-ctip-primary');
      }
    });
  }

  clickStatusButton() {
    cy.get('.btn-group>button').click();
  }

  clickStatus(count: number) {
    cy.get('.inform>li').eq(count).click();
  }

  clickAddIncidentButton() {
    cy.get('[data-test="add-incident"]').click();
  }

  //0 for New Incident tab & 1 for Existing incident
  clickNewIncidentTab() {
    cy.get("ul[role='tablist']>li").eq(0).click();
  }

  enterIncidentName(text: string) {
    cy.get('form input').eq(0).clear().type(text);
  }

  selectIncidentType(i: number) {
    cy.get('form select').select(i);
  }

  selectIncidentUser(i: number) {
    cy.get('form input').eq(1).click();
    cy.get("div[role='listbox']>div[role='option']").eq(i).click();
  }

  clickLabelIcon() {
    cy.get('div.m-2.uppercase').each(($el) => {
      if ($el.text() == 'LABELS') {
        cy.wrap($el).next().click();
      }
    });
  }

  assignLabel(i: number) {
    cy.get('[role="group"]>div').eq(i).click();
    return this;
  }

  clickCreateLabelButton() {
    cy.get('.justify-end>button:visible').click();
  }

  enterLabelName(text: string) {
    cy.get('input[name="name"]').clear().type(text);
  }

  selectColor(i: number) {
    cy.get('#label-color').click();
    cy.get("div[role='option']")
      .not('[disabled="true"]')
      .then(($el) => {
        cy.wrap($el).eq(i).click();
      });
  }

  selectLabelType(typeIndex: number) {
    cy.get('label>span:nth-child(1)').eq(typeIndex).click();
  }

  clickAssignLabelButton() {
    cy.get('button.bx--btn--primary.bx--btn--lg:visible').click();
  }

  enterComment(str: string) {
    cy.get('div>textarea').type(str);
  }

  clickLanguagebutton() {
    cy.get('.relative>button').click();
  }

  rateThreat(i: number) {
    cy.get('.grid>svg')
      .eq(i - 1)
      .click();
    cy.wait(3000);
  }

  selectLanguage(str: string) {
    cy.get('.w-full>li>.flex').each(($el) => {
      if ($el.text().includes(str)) {
        cy.wrap($el).click();
      }
    });
  }

  clickCautionIcon(icon: number) {
    cy.get('button[aria-live="polite"]+button').eq(icon).click({ force: true });
  }

  selectIncident() {
    cy.get('div[data-test="select-incident"] select').select(getRandomInt(4) + 1);
    return this;
  }

  clickSaveButton() {
    cy.get('button.bx--btn--primary:visible').click();
    return this;
  }

  clickLabelButton() {
    cy.get('button[title="Labels"]').click();
  }

  clickEditButton(text: string) {
    cy.get('button.bx--btn--primary:visible').click();

    cy.readFile('fixtures/threat/ThreatLabel.json').then((data) => {
      data.label = text;
      cy.writeFile('fixtures/threat/ThreatLabel.json', data);
    });
    return this;
  }

  changeIncidentStatus() {
    cy.readFile('fixtures/threat/ThreatList.json').then((data) => {
      data.list[0].issued = true;
      cy.writeFile('fixtures/threat/ThreatList.json', data);
    });
  }

  clickEditLabelButton(i: number) {
    cy.get('[aria-label="selectable tiles"] button').eq(i).click();
  }

  clickDeleteLabelButton() {
    cy.get('.bx--btn--danger:visible').click();
    return this;
  }

  searchForLabel(text: string) {
    cy.get("[placeholder='Search...']:visible").type(text);
  }

  removeIncident() {
    cy.get('button.text-ctip-dangerThreat').click();

    cy.readFile('fixtures/threat/ThreatList.json').then((data) => {
      data.list[0].issued = false;
      cy.writeFile('fixtures/threat/ThreatList.json', data);
    });

    return this;
  }

  clickSettingsIcon() {
    cy.get('[data-testid="toolbar-menu"]').click()
  }

  clickExportAll() {
    cy.get('[role="none"]').click()
  }

  assertWarning() {
    cy.get('[aria-label="Export to Excel"] div>p:nth-child(1)').should('contain', '5000 exportable')
  }

  clickExportButton() {
    cy.get('button.bx--btn--primary:visible').click()
  }

  clickExportSelectedButton() {
    cy.get('[title="Export selected"]').click()
  }

  clickMoveBtn() {
    cy.get('button[title="Move to Module"]').click()
  }

  selectOrganization(selectedOption: string) {
    cy.get('fieldset select').eq(0).select(selectedOption)
  }

  selectModule(selectedOption: string) {
    cy.get('fieldset select').eq(1).select(selectedOption)
  }

  clickAccept() {
    cy.get('button.bx--btn--primary:visible').click();
  }

  clickCopy() {
    cy.get('[value="1"]+label>span').first().click()
  }

  clickStatusBtn() {
    cy.get('[data-test="inform-button"]').first().click({ force: true })
  }

  selectStatus(i: number) {
    cy.get('.inform>li').eq(i).click({ force: true })
  }

  clickChangeStatus() {
    cy.get('[data-test="Change_relevance"]').click()
  }

  selectGroupStatus() {
    cy.get('[data-test="NOT_IMPORTANT0"]').click()
  }

  clickChangeButton() {
    cy.get('button.bx--btn--primary:visible').click();
  }

  clickOpenNewTab() {
    cy.get('[data-test="Open_new_tab"]').click()
  }

  clickDeleteButton() {
    cy.get('[data-test="Delete_Result_Modal"]').click()
  }

  clickCopyButton() {
    cy.get('[data-test="Copy_clipboard"]').find('button').click()
  }

  clickTemporalDelete() {
    cy.get('[data-test="Delete_Temporal" ]').click()
  }

  checkWarning() {
    cy.contains("undone")
  }

  clickBlockSubUrls() {
    cy.get('[data-test="Delete_Block_Url/subUrl"]').click()
  }

  clickBlockDomain() {
    cy.get('[data-test="Delete_Block_entire Domain"]').click()
  }

  clickFilterButton() {
    cy.get('[data-test="filter"]').click()
  }

  clickThreatStatusDropdown() {
    cy.get('[data-test="Threat_status"]').click()
  }

  selectThreatStatus(status: number) {
    cy.get('#menu-read-status input[type="checkbox"]').eq(status).check({ force: true })
  }

  clickApply() {
    cy.get('[data-test="Apply"]').click();
  }

  clickClearFilters() {
    cy.get('[data-test="Clear_filters"]').click()
  }

  selectGroup(group: number) {
    cy.get('[data-test="group_label"]').eq(group).click({ force: true })
  }

  selectLabel(label: number) {
    cy.get('[data-test="labels"]').eq(label).click()
  }

  clickSourceBox() {
    cy.get('[data-test="Sources"]').click()
  }

  searchForSource(word: string) {
    cy.get('[data-test="Sources"]').click()
    cy.get('[data-test="Sources"]').clear().type(word)
  }

  selectSource(max: number) {
    let index: number
    for (index = 0; index < max; index++) {
      cy.get('[role="option"]').eq(index).click()
    }
  }

  clickSearchBox() {
    cy.get('[role="combobox"]').eq(1).click()
  }

  searchForWord(word: string) {
    cy.get('[role="combobox"]').eq(1).click()
    cy.get('[role="combobox"]').eq(1).clear().type(word)
  }

  selectWord(max: number) {
    let index: number
    for (index = 0; index < max; index++) {
      cy.get('[role="option"]').eq(index).click()
    }
  }

  clickThreatStatusButton(){
    cy.get('[for="read-status"]+div>div').click()
  }

  toggleCheckBox(str: string) {
    cy.get(".bx--toggle-input__label>span").each(($el) => {
      if ($el.text().includes(str)) {
        cy.wrap($el).next().click();
      }
    })
  }

enterStartDate(date:string)
  {
    cy.get(".flatpickr-wrapper>input").type(date+"{enter}")
  }

  enterEndDate(date:string)
  {
    cy.get(".bx--date-picker-input__wrapper>input").type(date+"{enter}")
  }

  clickRemoveDates()
  {
    cy.get('button.bx--tooltip--align-center').eq(9).click()
  }

  checkSearchDisabled()
  {
    cy.get('[aria-haspopup="true"] [role="searchbox"]').invoke('attr', 'disabled').should('exist')
  }

  closeSearchMenu() {
    cy.get("input[aria-expanded='true']+div").click()
  }

  clickSearchBar()
  {
    cy.get('.items-center [role="search"]').click();
  }

  searchText(text: string)
  {
    cy.get('.items-center [role="search"]').type(text)
  }

  clearSearchedText(){
    cy.get(".bx--toolbar-search-container-active [aria-label='Clear search input']").click()
  }

  selectRating()
  {
    cy.get('.grid>svg').eq(getRandomInt(3) + 1).click()
  }

  checkFiltersDisabled()
  {
    cy.get('[aria-expanded="false"] button').invoke('attr', 'disabled').should('exist')
  }

  closeModal() {
    cy.get('.bx--modal-close__icon:visible').click();
    cy.get('.bx--modal-close__icon:visible').should('not.exist');
  }
}
export default ThreatsPage;
