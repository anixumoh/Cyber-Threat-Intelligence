import { ENDPOINTS } from 'pom/helpers/spoofing/endpoints.ts';
import { LoginEntity } from './entity';
import { CypressTests } from 'pom/helpers/spoofing/cypressTests.ts';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(val: LoginEntity): Chainable<void>;
      clickNavbarMenu(menu: string): Chainable<void>;
      addOrgByRequest(body: Cypress.RequestBody | undefined): Chainable<void>;
      loginOrg(): Chainable<void>;
      interceptRequest(endpoint: SpoofedURLS): Chainable<void>;
      callSpecificSpoofedRequest(endpoint: ENDPOINTS, overloadedFixture?: string): Chainable<void>;
      callSpoofedRequestsForTestCase(test: CypressTests, skipRequests: Array<ENDPOINTS> = []): Chainable<void>;
      waitForAllLoginRequestsToFinish(): Chainable<void>;
      loginByRequest(loginEntity: LoginEntity, urlValue: string): Chainable<void>;
      clickButton(buttonName: string): Chainable<void>;
      logout(): Chainable<void>;
      closeModal(): Chainable<void>;
      goToOrganization(orgName: string): Chainable<void>;
      goToModule(moduleType: string, index?: number): Chainable<void>;
      closeModal(): Chainable<void>;
      clickNavbarMenu(menu: string): Chainable<void>;
      assertToast(text: string): Chainable<void>;
      assertURL(text: string): Chainable<void>;
      selectAdminMenu(text: string): Chainable<void>;

      //custom navigation commands
      selectAnOrganization(org: string): Chainable<void>;
      clickMenu(menu: string): Chainable<void>;
      clickSubMenu(subMenu: string): Chainable<void>;
      clickSubMenuOption(optionName: string): Chainable<void>;
      verifyCurrentPage(str: string): Chainable<void>;
      clickSetFilter():Chainable<void>
    }
  }
}
