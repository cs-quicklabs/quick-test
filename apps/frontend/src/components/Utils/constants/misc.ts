export const enum ToastMessage {
  SOMETHING_WENT_WRONG = "Something went wrong",
  IMAGE_FILE_TYPE = "File type must be either png or jpeg",
  IMAGE_FILE_SIZE = "File size shouldn't exceed 1MB",
  NO_TEST_CASE_SELECTED = "No Test Case is selected",
  NO_TEST_RUN_EXPORT = "No Test Run to export",
  INVALID_CARD = "Your card is invalid, please enter correct details",
  CREATE_NEW_ACCOUNT = "Create a new account!",
  ADD_PAYMENT_METHOD = "Add a payment method",
  EXPORT_TEST_CASE_PDF = "Select Test Cases to be exported as pdf",
  TEST_CASES_EDIT_UPDATE = "You need to update at least one field",
  CONTACT_ADMINISTRATOR = "Please contact your Administrator",
  ALREADY_LOGGED_IN = "Already logged In",
  NO_TEST_CASE_PROJECT = "No Test Case in this project",
  TEST_CASE_SELECT_ATLEAST_ONE = "Please select atleast one Test Case",
  PLAN_REACTIVATION_SUCCESS = "Re-activation successful",
  PLAN_UPGRADATION_SUCCESS = "Upgradation successful",
  SUBSCRIPTION_CANCEL = "Subscription has been canceled successfully",
  BILLING_INFO_SUCCESS = "Billing information added successfully",
  ADD_CARD_SUCESS = "Card has been added successfully",
  PRIMARY_CARD_UPDATE = "Primary card updated",
  REMOVE_CARD_SUCCESS = "Card has been removed successfully",
  MEMBER_ADDED = "Member added successfully",
  MEMBER_DELETED = "Member deleted successfully",
}

export const ValidatorMessage = {
  EMAIL_NOT_VALID: "Email is not valid",
  EMAIL_REQ: "Email is required",
  ORGANIZATION_NAME_NOT_VALID: "Organization name is not valid",
  ORGANIZATION_REQ: "Organization is required",
  PASS_REQ: "Password is required",
  PASS_MIN_LENGTH: "Password is too short - should be 8 chars minimum",
  FIRST_NAME_NOT_VALID: "First name cannot accept spaces, numbers and special characters",
  FIRST_NAME_SPACE_NOT_VALID: "First Name cannot accept space",
  FIRST_NAME_REQ: "First Name is required",
  FIRST_NAME_LENGTH: "First Name must be between 1 to 32 characters.",
  FIRST_NAME_MIN_LENGTH: "First Name should be minimum 3 characters",
  LAST_NAME_NOT_VALID: "Last name cannot accept spaces, numbers and special characters",
  LAST_NAME_SPACE_NOT_VALID: "Last Name cannot accept space",
  LAST_NAME_REQ: "Last Name is required",
  LAST_NAME_MIN_LENGTH: "Last Name should be minimum 3 characters",
  CITY_NOT_VALID: "City is not valid",
  CITY_REQ: "City is required",
  POSTAL_CODE_REQ: "Postal Code is required",
  POSTAL_CODE_ELIGIBILTY: "Postal Code should be a number",
  MAX_VALUE_LIMIT: "Maximum value must not exceed 6",
  MIN_VALUE_LIMIT: "Minimum value must be at least 4",
  ADDRESS_REQ: "Address is required",
  STATE_REQ: "State is required",
  MIN_VALUE_LIMIT_CITY_STATE: "Minimum value must be at least 2",
  STATE_ELIGIBILITY: "State is not valid",
  COUNTRY_REQ: "Country is required",
  JIRA_ADDRESS_REQ: "JIRA Address is required",
  API_TOKEN_REQ: "API Token is required",
  SUMMARY_REQ: "Summary is required",
  PROJECT_REQ: "Project is required",
  ISSUE_TYPE_REQ: "Issue Type is required",
  PARENT_REQ: "Parent is required",
  NAME_MAX_LENGTH: "Name should be maximum 32 characters",
  NAME_REQUIRED: "Name is required",
  DESCRIPTION_REQ: "Description is required",
  START_DATE_REQ: "Start Date is required",
  END_DATE_REQ: "End Date is required",
  OLD_PASS_REQ: "Old Password is required",
  NEW_PASS_REQ: "New Password is required",
  OLD_AND_NEW_PASS_CANNOT_SAME: "Old and new password cannot be same",
  BOTH_PASS_SAME: "Both passwords need to be same",
  CONFIRM_PASS_REQ: "Confirm Password is required",
  NAME_REQ: "Name is required",
  DESC_LENGTH: "Description should be maximun 500 characters",
  ASSIGN_REQ: "Assign to is required",
  TITLE_REQ: "Title is required",
  PRECONDITIONS_REQ: "Preconditions are required",
  STEPS_REQ: "Steps are required",
  EXPECTED_RESULT_REQ: "Expected Results are required",
  FIRST_NAME_MAX_LENGTH: "First Name should be maximum 32 characters",
  LAST_NAME_MAX_LENGTH: "Last Name should be maximum 32 characters",
  TITLE_NOT_VALID: "Title is not valid",
};

export const NO_PERMISSION_TOOLTIP_MESSAGE =
  "You don't have required permission";

export const enum IssueType {
  SUBTASK = "Subtask",
}

export const LanguageList = [
  { id: "en", name: "English" },
  { id: "es", name: "Spanish" },
  { id: "ar", name: "العربية" },
];

export const Currency = {
  USD: "usd",
};

export enum freeTrial {
  TRIAL_DAYS = 14,
}

export const SubscriptionStatus = {
  ACTIVE: "active",
  CANCELLED: "cancelled",
  FREE_TRIAL: "freeTrial",
  CANCEL_AT_PERIOD_END: "cancelAtPeriodEnd",
};

export enum NoOfTestCases {
  TAKE_FIVE = 5,
}

export enum NoOfDaysForGraph {
  DEFAULT = 7,
}
