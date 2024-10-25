Feature: Dashboard Functionality

    Scenario: Verify visibility of Explorer module in Modules dropdown
        Given A master user is logged in and is at the dashboard
        Then the menu element named "explorer" should not be visible

        When the user clicks on the Modules dropdown
        Then the "explorer" module should exist in the list
