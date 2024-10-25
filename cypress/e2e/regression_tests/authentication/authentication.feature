Feature: Feature-Authentication
As a user I want to log into the system so I can manage actions allowed to the role assigned

Background:
Given I am in the login page
Then Username is empty
Then Password is empty

Scenario Outline: Successful / Failed login
The scenario controle when the user success or not when making a login action
When the user types <Username>
When the user enters <Password>
When the user clicks on Login button
##Then the user is redirected to <Redirection>
## Scenario Outlines being compared must have the same path - i.e invalid username and invalid password scenario
## Message validation below is invalid because of the scenario variation between Successful & Failed
#Then "<Message>" message is shown

Examples:
| Username          | Password          | Message                   | Redirection |
| "qa@blueliv.com"  | ")-v$ASY6DCE9W7c" | Welcome to Threat Compass | "dashboard" |
| "test2@test2.com" | "321ewq"          | Wrong Credentials         | "login"     |
