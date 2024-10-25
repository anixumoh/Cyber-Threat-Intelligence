Feature: Dashboard Functionality

    Scenario: Verify adding a new module though admin panel
        Given A Master user logs in the web
        When the user clicks on the Admin panel
        Then the user clicks on the dropdown modules button of the first organization
        Then the user clicks on the New Module button
        Then a popup appears with buttons and one of them is called 'Explorer'