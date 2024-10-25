# Feature: As an admin I want to perform some functional actions on a user e.g(add user, delete user, search user, edit user)etc

#     Background:
#         Given user is logged in
#         When user clicks on admin
#         Then user clicks on the users on the sidebar

#     Scenario: Add a new user
#         When admin clicks on the add user button
#         And admin enters the correct details of the users
#         And user clicks on the create button to create a user
#         Then user should be returned to the users page

#     Scenario: Search for a user
#         When user enter a valid first name in the search field
#         Then user asserts for the user in the search list displayed

#     Scenario: Disable a user by changing users status
#         When admin clicks a users checkbox
#         And admin clicks on the red button to disable the users status
#         And user is disabled
#         Then user should be returned to the users page

#     Scenario: Enable a user by changing users status
#         When admin clicks a users checkbox
#         And admin clicks on the green button to enable the users status
#         And user is enabled
#         Then user should be returned to the users page

#     Scenario: Disable a user by clicking the toggle icon
#         When user clicks on the toggle icon
#         And user is disabled
#         Then user should be returned to the users page

#     Scenario: Enable a user by clicking the toggle icon
#         When user clicks on the toggle icon
#         And user is enabled
#         Then user should be returned to the users page

#     Scenario: Edit a user
#         When user clicks on the edit option
#         And user edits the required field
#         And user clicks on the save button
#         Then user should be returned to the users page

#     Scenario: Delete a user
#         When user clicks on the delete icon
#         And user clicks on the yes confirmation button
#         Then user should be returned to the users page