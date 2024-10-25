Feature: Dashboard Functionality

    Scenario: Verify adding a new module
        Given A Master user logs in the web
        When the user clicks on the MODULES dropdown
        Then the user clicks on the "New Module" button
        Then a <li> element with the text "Explorer" should be visible