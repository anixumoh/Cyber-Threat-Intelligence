Feature: As a user I want to be able order my filters with a button

    Scenario: User should be to change the order of the filters with a button
        # Master
        Given Master User is logged in and is on the settings tab of a module and opened the filter section
        When Master User clicks on reoder button of a row in the table and introduces a new position to another manually created filter
        Then The correct order should be sent to the backend for Manually created filter
        When Master User clicks on reoder button of a row in the table and introduces a new position to Automatically created filter
        Then The correct order should be sent to the backend for Automatically created filter
        # SuperAdmin
        Given SuperAdmin User is logged in and is on the settings tab of a module and opened the filter section
        When SuperAdmin User clicks on reoder button of a row in the table and introduces a new position to manually created filter
        Then The correct order should be sent to the backend as SuperAdmin
        When SuperAdmin User clicks on reoder button of a row in the table and introduces a new position to Automatically created filter
        Then There should be an error message
        # rest of users
        # No need to check for movement above automatically created filter as they wont get returned from the API
        Given Normal User is logged in and is on the settings tab of a module and opened the filter section
        When Normal User clicks on reoder button of a row in the table and introduces a new position
        Then The correct order should be sent to the backend as NormalUser
