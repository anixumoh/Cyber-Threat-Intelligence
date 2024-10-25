Feature: Try to change user's password with a new password

Scenario: Change user's password with a new password
Given the user is presented with a form with 3 password fields in ProfileAccount
When the user clicks on the change password row
And the user enters the old password on the first input field
And the user enters a new password on the second input field
And the user enters the same new password on the third input field
And there are no errors in the form
And user clicks on the submit button
Then the user should be presented with a feedback message saying that the password has been changed correctly