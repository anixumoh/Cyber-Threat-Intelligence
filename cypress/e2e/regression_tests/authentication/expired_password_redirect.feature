Feature: Expired password redirects to /expired page

    Scenario: When a user logs in with an expired password they should be redirected to the expired page
        Given I am in the login page
        When I enter my username
        When I enter my password
        Then I click login and should be presented with a feedback message and redirected to the expired page