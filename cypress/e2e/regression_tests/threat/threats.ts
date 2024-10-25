import { After, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import ThreatsPage from 'pom/general/ThreatsPage.ts';
import { UsersUtils } from 'pom/general/users_utils.ts';
import { getRandomInt } from 'pom/helpers/number-generators.ts';
import { getRandomText } from 'pom/helpers/text-generators.ts';
import { LoginEntity } from 'support/entity.ts';

const threatsPage = new ThreatsPage();

beforeEach('', () => {
  cy.callSpoofedRequestsForTestCase('Threats');
});

Given('the user is logged into the system', () => {
  let user: LoginEntity = UsersUtils.getSmokeTestUser();
  cy.login(user);
});

//was And 
Given('the user is in the Threat section of any module', () => {
  cy.goToModule('dark_web');
});

// Scenario: Check a selected threat is marked as read when it has been clicked on
When('user clicks on a threat', () => {
  threatsPage.clickOnThreat(1);
});

Then("the button in the threats details page should read 'Mark as unread'", () => {
  threatsPage.verifyBtnPresence('unread');
});

// Scenario: Check that multiple threats can be marked as read
When('the user selects multiple threats', () => {
  const no_of_Threats = 2;
  threatsPage.selectThreat(no_of_Threats);
});

Then("the user clicks on the 'Mark as read' option", () => {
  threatsPage.clickMarkAsRead();
});

// Scenario: Check that multiple threats can be marked as unread
Then("the user clicks on the option 'Mark as Unread' option", () => {
  threatsPage.clickMarkAsUnread();
});

//Scenario Outline: Assign a rate to a threat
//TODO figure out why {string} when number is needed
When('the user clicks on {string}', (start: number) => {
  threatsPage.clickOnThreat(start);
});

//TODO figure out why {string} when number is needed
Then('the threat is rate with {string}', (start_value: number) => {
  threatsPage.rateThreat(start_value);
});

//Scenario: Mark a threat as favorite successfully
//was And
When('the user clicks on Mark as favorite button', () => {
  //Click mark as favorite button
  threatsPage.clickButtonInResource('favorite');
});

When('user clicks on Mark as unread button', () => {
  //Click mark as favorite button
  threatsPage.clickButtonInResource('unread');
});

When("verify button is mark as unread",()=>{
  threatsPage.verifyMarkAs('unread')
})

Then("verify button is mark as read",()=>{
  threatsPage.verifyUnmarkAs('read')
})

Then('the button is marked in blue color', () => {
  //Assert that the button has been clicked
  threatsPage.verifyMarkAs('favorite');
});

//Scenario: Assign to an Existing incident
When('user clicks on the caution icon', () => {
  threatsPage.clickCautionIcon(0);
});

When('user clicks on the active caution icon', () => {
  threatsPage.clickCautionIcon(1);
});

When('user selects threats', () => {
  threatsPage.selectThreat(1);
});

When('user clicks the mark as incident button', () => {
  cy.get('[title="Mark as Incident"]').click();
});

When('user clicks on the icon to remove threat', () => {
  threatsPage.removeIncident().closeModal();
});

When('the user selects an incident', () => {
  threatsPage.selectIncident();
  threatsPage.changeIncidentStatus();
});

Then('user clicks save', () => {
  threatsPage.clickSaveButton();
});

When('the user selects an incident and clicks save', () => {
  threatsPage.selectIncident().clickSaveButton();
});

When('user clicks on Label icon', () => {
  threatsPage.clickLabelIcon();
});

When('user clicks new Incident tab', () => {
  threatsPage.clickNewIncidentTab();
});

When('user adds a new incident and clicks save', () => {
  threatsPage.enterIncidentName('Incident ' + getRandomText(4));
  threatsPage.selectIncidentType(getRandomInt(2) + 1);
  threatsPage.selectIncidentUser(getRandomInt(2) + 1);
  threatsPage.clickSaveButton();
});

When('user selects a label', () => {
  threatsPage.assignLabel(getRandomInt(2) + 1);
});

Then('user assigns label to a threat', () => {
  threatsPage.clickAssignLabelButton();
});

Then('user removes label from the threat', () => {
  threatsPage.assignLabel(0).clickAssignLabelButton();
});

When('user on create label button', () => {
  threatsPage.clickCreateLabelButton();
});

When('user enters label details', () => {
  threatsPage.enterLabelName('Label ' + getRandomText(4));
  threatsPage.selectColor(getRandomInt(5) + 1);
  threatsPage.selectLabelType(getRandomInt(2));
});

Then('user clicks Save', () => {
  threatsPage.clickSaveButton().closeModal();
});

const label = 'Label ' + getRandomText(4);
When('user modifies the details of a label', () => {
  threatsPage.enterLabelName(label);
  threatsPage.selectColor(getRandomInt(5));
});

When('user clicks on the edit label icon', () => {
  threatsPage.clickEditLabelButton(getRandomInt(2));
});

Then('user clicks the Delete icon', () => {
  threatsPage.clickDeleteLabelButton().closeModal();
});

When('user searches and selects a label', () => {
  threatsPage.searchForLabel('Negative');
  threatsPage.assignLabel(0);
});

When('user clicks the label button', () => {
  threatsPage.clickLabelButton();
});

Then('user clicks Edit label button', () => {
  //Uses same class with save button
  threatsPage.clickEditButton(label).closeModal();
});

When('user clicks the settings icon', () => {
  threatsPage.clickSettingsIcon()
})

When('user clicks the Export all button', () => {
  threatsPage.clickExportAll()
})

Then('application displays warning message', () => {
  threatsPage.assertWarning()
  threatsPage.closeModal()
})

Then('user clicks Export selected button', () => {
  threatsPage.clickExportSelectedButton()
})

Then('user clicks Export button', () => {
  threatsPage.clickExportButton()
})

When("user clicks button to move resources", () => {
  threatsPage.clickMoveBtn()
})

When("user selects an organization", () => {
  threatsPage.selectOrganization("QA")
})

When("user clicks copy", () => {
  threatsPage.clickCopy()
})

When("user selects a module", () => {
  threatsPage.selectModule("Explorer")
})

When("user selects similar module", () => {
  threatsPage.selectModule("Dark Web2")
})

When("user clicks on the status button", () => {
  threatsPage.clickStatusBtn()
})

Then("user selects a status from the options", () => {
  threatsPage.selectStatus(getRandomInt(2))
})

Then("user clicks Accept", () => {
  threatsPage.clickAccept()
})

Then("resource should be moved successfully", () => {
  cy.assertToast("moved")
})

Then("resource should be copied successfully", () => {
  cy.assertToast("copied")
})

When("user clicks change relevance button", () => {
  threatsPage.clickChangeStatus()
})

When("user clicks Open new tab", () => {
  threatsPage.clickOpenNewTab()
})

When("user selects a status", () => {
  threatsPage.selectGroupStatus()
})

Then("user clicks change button", () => {
  threatsPage.clickChangeButton()
})


When("user clicks Delete button", () => {
  threatsPage.clickDeleteButton()
})

When("user clicks Temporal Delete button", () => {
  threatsPage.clickTemporalDelete()
  threatsPage.checkWarning()
})

When("user clicks block url or sub url button", () => {
  threatsPage.clickBlockSubUrls()
  threatsPage.checkWarning()
})

When("user clicks block entire domain", () => {
  threatsPage.clickBlockDomain()
  threatsPage.checkWarning()
})

Then("user confirms the action", () => {
  threatsPage.clickAccept()//Yes
})

Then("user clicks copy button", () => {
  threatsPage.clickCopyButton()
  threatsPage.closeModal()
})

Then("application displays success message", () => {
  cy.assertToast("deleted")
})

When("user clicks on the filter button", () => {
  threatsPage.clickFilterButton()
})

When("user selects the status of a threat", () => {
  threatsPage.clickThreatStatusDropdown()
})

When("user selects read as threat status", () => {
  threatsPage.selectThreatStatus(0)
})

When("user selects unread as threat status", () => {
  threatsPage.selectThreatStatus(1)
})

When("user selects or", () => {
  threatsPage.selectGroup(0)
})

When("user selects and", () => {
  threatsPage.selectGroup(1)
})

When("user selects not", () => {
  threatsPage.selectGroup(2)
})

When("user selects a filter label", () => {
  threatsPage.selectLabel(0)
})

When("user searches for a label", () => {
  threatsPage.searchForLabel("Hacktivism")
})

Then("user set filter", () => {
  cy.clickSetFilter()
})

Then("user applies the selected filter", () => {
  threatsPage.clickApply()
})

Then("user clears all filters", () => {
  threatsPage.clickClearFilters()
})

When("user searches for a source", () => {
  threatsPage.searchForSource("Manual")
})

When("user searches for multiple sources",()=>{
  threatsPage.searchForSource("Manual")
  threatsPage.selectSource(1)
  threatsPage.searchForSource("Breached")
  threatsPage.selectSource(1)
})

When("user selects source", () => {
  threatsPage.selectSource(1)
})

When("user clicks the sources field",()=>{
  threatsPage.clickSourceBox()
})

When("user Selects multiple sources",()=>{
  threatsPage.selectSource(2)
})

When("user Selects a source",()=>{
  threatsPage.selectSource(1)
})

Then("user unchecks a selected source",()=>{
  threatsPage.selectSource(1)
})

When("user searches for a word", () => {
  threatsPage.searchForWord("abc")
})

When("user searches for multiple words",()=>{
  threatsPage.searchForWord("abc")
  threatsPage.selectWord(1)
  threatsPage.searchForWord("Orphan")
  threatsPage.selectWord(1)
})

When("user selects word", () => {
  threatsPage.selectWord(1)
})

When("user clicks the search field",()=>{
  threatsPage.clickSearchBox()
})

When("user Selects multiple words",()=>{
  threatsPage.selectWord(2)
})

When("user Selects a word",()=>{
  threatsPage.selectWord(1)
})

Then("user unchecks a selected a word",()=>{
  threatsPage.selectWord(1)
})

When ("user clicks the status drop down",()=>{
  threatsPage.clickThreatStatusButton()
})

When("user selects status as read",()=>{
  threatsPage.selectThreatStatus(0)
})

When("user selects status as not read",()=>{
  threatsPage.selectThreatStatus(1)
})

When("user selects status as worked on",()=>{
  threatsPage.selectThreatStatus(2)
})

When("user selects status as not worked on",()=>{
  threatsPage.selectThreatStatus(3)
})

When("user selects multiple status",()=>{
  let i:number;
  for(i = 0; i < 2; i++){
  threatsPage.selectThreatStatus(i)
  }
})

When("user toggles the favorite button",()=>{
  threatsPage.toggleCheckBox("Favorite")
})

When("user toggles the incident button",()=>{
  threatsPage.toggleCheckBox("Incidents")
})

When("user toggles the followed button",()=>{
  threatsPage.toggleCheckBox("Followed")
})

When("user enters start date",()=>{
  threatsPage.enterStartDate("01/10/23")
})

When("user enters end date",()=>{
  threatsPage.enterEndDate("05/10/23")
})

When("user clicks remove dates",()=>{
  threatsPage.clickRemoveDates()
})

Then ("search button should be locked",()=>{
  threatsPage.checkSearchDisabled()
})

Then("user closes search",()=>{
  threatsPage.closeSearchMenu()
})

When("user clicks on the search icon",()=>{
  threatsPage.clickSearchBar()
})

Then("user searches for a resource",()=>{
  threatsPage.searchText("Sample")
})

Then("user clears the search",()=>{
  threatsPage.clearSearchedText()
})

Then("user selects a rate",()=>{
  threatsPage.selectRating()
})

Then("filter button should be locked",()=>{
  threatsPage.checkFiltersDisabled()
})

After(function () {
  cy.logout();
});
