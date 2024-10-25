Feature: As a user I want to be able to manage all threats

  Background:
    Given the user is logged into the system
    And the user is in the Threat section of any module

  Scenario: Check a selected threat is marked as read when it has been clicked on
    When user clicks on a threat
    Then the button in the threats details page should read 'Mark as unread'

  Scenario: Check that multiple threats can be marked as read
    When the user selects multiple threats
    Then the user clicks on the 'Mark as read' option

  Scenario: Check that multiple threats can be marked as unread
    When the user selects multiple threats
    Then the user clicks on the option 'Mark as Unread' option

  Scenario Outline: Assign a rate to a threat
    The user is able to assign a rate to a threat
    When the user clicks on <start>
    Then the threat is rate with <start_value>

    Examples:
      | start | start_value |
      | "1"   | "1"         |
      | "2"   | "5"         |
      | "3"   | "4"         |

  Scenario: Mark a threat as favorite successfully
    When user clicks on a threat
    And the user clicks on Mark as favorite button
    Then the button is marked in blue color

  Scenario: Assign existing incident to a threat
    When user clicks on the caution icon
    And the user selects an incident
    Then user clicks save

  Scenario: Remove incident from a threat
    When user clicks on the active caution icon
    Then user clicks on the icon to remove threat

  Scenario: Assign new incident to a threat
    When user clicks on the caution icon
    And user clicks new Incident tab
    Then user adds a new incident and clicks save

  Scenario: Assign incident to multiple threats
    When user selects threats
    And user clicks the mark as incident button
    Then the user selects an incident and clicks save

  Scenario: Assign label to a threat
    When user clicks on a threat
    And user clicks on Label icon
    And user selects a label
    Then user assigns label to a threat

  Scenario: Remove label from a threat
    When user clicks on a threat
    And user clicks on Label icon
    Then user removes label from the threat

  Scenario: Create a label
    When user clicks on a threat
    And user clicks on Label icon
    And user on create label button
    And user enters label details
    Then user clicks Save

  Scenario: Edit a label
    When user clicks on a threat
    And user clicks on Label icon
    And user clicks on the edit label icon
    And user modifies the details of a label
    Then user clicks Edit label button

  Scenario: Delete a label
    When user clicks on a threat
    And user clicks on Label icon
    And user clicks on the edit label icon
    Then user clicks the Delete icon

  Scenario: Search for a label
    When user clicks on a threat
    And user clicks on Label icon
    And user searches and selects a label
    Then user assigns label to a threat

  Scenario: Assign a label to multiple threats
    When user selects threats
    And user clicks the label button
    And user selects a label
    Then user assigns label to a threat

  Scenario: Assert warning message when user exports all resources
    When user clicks the settings icon
    And user clicks the Export all button
    Then application displays warning message

  Scenario: Export all resources
    When user clicks the settings icon
    And user clicks the Export all button
    Then user clicks Export button

  Scenario: Export selected resources
    When user selects threats
    Then user clicks Export selected button

  Scenario: Move resource to another organization
    When user selects threats
    And user clicks button to move resources
    And user selects an organization
    And user selects a module
    And user clicks Accept
    Then resource should be moved successfully

  Scenario: Move resource to same module type
    When user selects threats
    And user clicks button to move resources
    And user selects similar module
    And user clicks Accept
    Then resource should be moved successfully

  Scenario: Copy resource to another organization
    When user selects threats
    And user clicks button to move resources
    And user clicks copy
    And user selects an organization
    And user selects a module
    And user clicks Accept
    Then resource should be copied successfully

  Scenario: Copy resource to same module type
    When user selects threats
    And user clicks button to move resources
    And user clicks copy
    And user selects similar module
    And user clicks Accept
    Then resource should be copied successfully

  Scenario: Change default status of a resource
    When user clicks on the status button
    Then user selects a status from the options

  Scenario: Change default status of multiple resources
    When user selects threats
    And user clicks change relevance button
    And user selects a status
    Then user clicks change button

  Scenario: Delete single resource
    When user selects threats
    And user clicks Delete button
    And user clicks Temporal Delete button
    And user confirms the action
    Then application displays success message

  Scenario: Delete multiple resources
    When the user selects multiple threats
    And user clicks Delete button
    And user confirms the action
    Then application displays success message

  Scenario: Block URL/sub URL of a resource
    When user selects threats
    And user clicks Delete button
    And user clicks block url or sub url button
    Then user confirms the action

  Scenario: Block entire domain of a resource
    When user selects threats
    And user clicks Delete button
    And user clicks block entire domain
    Then user confirms the action

  Scenario: Copy entire domain of a resource
    When user selects threats
    And user clicks Delete button
    Then user clicks copy button

  Scenario: Clear all filters
    When user clicks on the filter button
    And user selects the status of a threat
    And user selects read as threat status
    And user applies the selected filter
    Then user clears all filters

  Scenario: Filter resources by read
    When user clicks on the filter button
    And user selects the status of a threat
    And user selects read as threat status
    Then user applies the selected filter

  Scenario: Filter resources by unread
    When user clicks on the filter button
    And user selects the status of a threat
    And user selects unread as threat status
    Then user applies the selected filter

  Scenario: Search for a label
    When user clicks on the filter button
    And user selects and
    And user searches for a label
    And user selects a filter label
    And user set filter
    Then user applies the selected filter

  Scenario: Filter resources by Label or
    When user clicks on the filter button
    And user selects or
    And user selects a filter label
    And user set filter
    Then user applies the selected filter

  Scenario: Filter resources by Label and
    When user clicks on the filter button
    And user selects and
    And user selects a filter label
    And user set filter
    Then user applies the selected filter

  Scenario: Filter resources by Label not
    When user clicks on the filter button
    And user selects not
    And user selects a filter label
    And user set filter
    Then user applies the selected filter

  Scenario: Filter by source
    When user clicks on the filter button
    And user searches for a source
    And user selects source
    And user closes search
    Then user applies the selected filter

  Scenario: Filter by multiple sources
    When user clicks on the filter button
    And user clicks the sources field
    And user Selects multiple sources
    And user closes search
    Then user applies the selected filter

  Scenario: Uncheck a source
    When user clicks on the filter button
    And user clicks the sources field
    And user Selects a source
    And user unchecks a selected source
    And user closes search
    Then user applies the selected filter

  Scenario: Filter source by multiple sources
    When user clicks on the filter button
    And user searches for multiple sources
    And user closes search
    Then user applies the selected filter

  Scenario: Filter by searched word
    When user clicks on the filter button
    And user searches for a word
    And user selects word
    And user closes search
    Then user applies the selected filter

  Scenario: Filter by multiple words
    When user clicks on the filter button
    And user clicks the search field
    And user Selects multiple words
    And user closes search
    Then user applies the selected filter

  Scenario: Uncheck a selected word
    When user clicks on the filter button
    And user clicks the search field
    And user Selects a word
    And user unchecks a selected a word
    And user closes search
    Then user applies the selected filter

  Scenario: Filter by multiple searched words
    When user clicks on the filter button
    And user searches for multiple words
    And user closes search
    Then user applies the selected filter

  Scenario: Filter resources status by Read
    When user clicks on the filter button
    And user clicks the status drop down
    And user selects status as read
    Then user applies the selected filter

  Scenario: Filter resources status by not read
    When user clicks on the filter button
    And user clicks the status drop down
    And user selects status as not read
    Then user applies the selected filter

  Scenario: Filter resources status by worked on
    When user clicks on the filter button
    And user clicks the status drop down
    And user selects status as worked on
    Then user applies the selected filter

  Scenario: Filter resources status by not worked on
    When user clicks on the filter button
    And user clicks the status drop down
    Then user selects status as not worked on

  Scenario: Filter resources status by multiple status
    When user clicks on the filter button
    And user clicks the status drop down
    And user selects multiple status
    Then user applies the selected filter

  Scenario: Filter resources by Favorite
    When user clicks on the filter button
    And user toggles the favorite button
    Then user applies the selected filter

  Scenario: Remove favorite filter
    When user clicks on the filter button
    And user toggles the favorite button
    And user applies the selected filter
    And user clicks on the filter button
    And user toggles the favorite button
    Then user applies the selected filter

  Scenario: Filter resources by Incidents
    When user clicks on the filter button
    And user toggles the incident button
    Then user applies the selected filter

  Scenario: Remove incident filter
    When user clicks on the filter button
    And user toggles the incident button
    And user applies the selected filter
    And user clicks on the filter button
    And user toggles the incident button
    Then user applies the selected filter

  Scenario: Filter resources by followed
    When user clicks on the filter button
    And user toggles the followed button
    Then user applies the selected filter

  Scenario: Remove followed filter
    When user clicks on the filter button
    And user toggles the followed button
    And user applies the selected filter
    And user clicks on the filter button
    And user toggles the followed button
    Then user applies the selected filter

  Scenario: Filter by date range
    When user clicks on the filter button
    And user enters start date
    And user enters end date
    Then user applies the selected filter

  Scenario: Clear date range
    When user clicks on the filter button
    And user enters start date
    And user enters end date
    And user clicks remove dates
    Then user applies the selected filter

  Scenario: To check that search option is locked when Filter option is displayed
    When user clicks on the filter button
    Then search button should be locked

  Scenario: To check that Filter option is locked when search option is displayed
    When user clicks on the search icon
    Then filter button should be locked

  Scenario: To check the criteria is removed when clicking on the cross option inside the search field
    When user clicks on the search icon
    And user searches for a resource
    Then user clears the search

  Scenario: To check the option Mark as unread is shown when accessing to the threat detail
    When user clicks on a threat
    Then verify button is mark as unread

  Scenario: To check the user is able to mark as unread the resource by clicking on Mark as unread button
    When user clicks on a threat
    And user clicks on Mark as unread button
    Then verify button is mark as read

  Scenario: To confirm the user is able to rate from 1 to 5 stars a threat
    When user clicks on a threat
    Then user selects a rate

  Scenario: To confirm the rate can be modified to a lower or higher star
    When user clicks on a threat
    And user selects a rate
    Then user selects a rate