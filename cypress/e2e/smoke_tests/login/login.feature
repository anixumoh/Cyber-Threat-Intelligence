Feature: As a tester for a new release, I want to be able to login

Scenario: Login as a valid user
  Given a valid user
  When the user logs in
  Then the user should be taken to the home page