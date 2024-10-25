Feature: As a tester for a new release, I want to be able to find the version just deployed

Scenario: View version
  Given an admin user is logged in
  When the user clicks on admin
  When the user clicks on the version button
  Then the user should be able to view the version