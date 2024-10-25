Feature: Verify an user can change their expired password

    Scenario: When an user tries to login with an expired password gets redirected to the expired page and can change their password
        Given I am in the login page
        When I enter my username
        When I enter my password
        When I click login and should be presented with a feedback message and redirected to the expired page
        When I enter my old password
        When I enter my new password
        When I enter my new password again
        Then I click change password and should be presented with a feedback message and redirected to the login page