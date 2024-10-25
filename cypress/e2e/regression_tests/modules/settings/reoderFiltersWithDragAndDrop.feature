Feature: As a user I want to be able order my filters with drag and drop functionality

    Scenario: User should be to change the order of the filters with the drag and drop functionality
        #Master
        Given Master User is logged in and is on the settings tab of a module and opened the filter section
        When Master User drag and drops a manually created filter to another manually created filter
        Then The correct order should be sent to the backend for Manually created filter
        When Master User drag and drops a manually created filter over Automatically created filter
        Then The correct order should be sent to the backend for Automatically created filter
        # SuperAdmin
        Given SuperAdmin User is logged in and is on the settings tab of a module and opened the filter section
        When SuperAdmin User drag and drops a manually created filter to another manually created filter
        Then The correct order should be sent to the backend as SuperAdmin
        When SuperAdmin User drag and drops a manually created filter to Automatically created filter
        Then There should be an error message
        # rest of users
        # No need to check for drag&drop above automatically created filter as they wont get returned from the API
        Given Normal User is logged in and is on the settings tab of a module and opened the filter section
        When Normal User drag and drops a manually created filter to another manually created filter
        Then The correct order should be sent to the backend as NormalUser
