Feature: In resource detailss table, in the Crime Service Type column the type TELEGRAM should not be a link

    Scenario: Verify that the telegram text is not a link
        Given Any user logs in the web
        When in the details of a credit card module resource
        Then the user can see a table with a row with the Crime Service Type of telegram and verify that the telegram text is not a link
