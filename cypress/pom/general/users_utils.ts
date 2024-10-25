import { LoginEntity } from 'support/entity.ts';

export class UsersUtils {
  static getSmokeTestUser(): LoginEntity {
    return {
      username: Cypress.env('TC_SMOKE_TEST_USERNAME'),
      password: Cypress.env('TC_SMOKE_TEST_PASSWORD')
    };
  }
}
