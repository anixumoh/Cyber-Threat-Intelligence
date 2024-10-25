export default interface User {
  name: string;
  firstSurname: string;
  secondSurname: string;
  email: string;
  username: string;
  id: number;
  password: string;
  address: string;
  telephone: null;
  cellphone: null;
  job: string;
  companiesId: string;
  expirationTime: string;
  timezone: string;
  internalUser: boolean;
  grants: Grants;
  status: string;
  lastPasswordChangeTime: number;
  lastIpAddress: string;
  createdAt: number;
  updatedAt: number;
  licenseAccepted: boolean;
  twoFactorAuthentication: boolean;
  lastLoginAt: number;
  landingPage: string;
  groups: number[];
  masterGrant: string;
  sessionTimeout: number;
  eventMessageActivated: boolean;
  customerId: number;
  daysToPasswordChange?: number;
  api: boolean;
}

interface Grants {
  userId: number;
  username: string;
  superadmin: boolean;
  master: boolean;
  sales: boolean;
  trial: boolean;
  superSearchGrants: SuperSearchGrant[];
  superSearchGrantsMap: SuperSearchGrantsMap;
  mssp_admin: boolean;
}

interface SuperSearchGrant {
  reputationalSearchGrantsMap: ReputationalSearchGrantsMap;
  itemId: number;
  analyst: boolean;
  operator: boolean;
  mssp_customer: boolean;
  reputationalSearchGrants: ReputationalSearchGrant[];
}

interface ReputationalSearchGrant {
  itemId: number;
  analyst: boolean;
  operator: boolean;
  mssp_customer: boolean;
}

interface ReputationalSearchGrantsMap {
  [key: string]: ReputationalSearchGrant;
}

interface SuperSearchGrantsMap {
  [key: string]: SuperSearchGrant;
}
