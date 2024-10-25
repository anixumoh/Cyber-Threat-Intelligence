export default interface Organization {
  id: any;
  enabled: boolean;
  name: string;
  createdAt: number;
  industryId: string;
  trial: boolean;
  trialExpirationDate: number;
  contact: Contact;
  catalogId: number;
  customerId: number;
  enabledMfa: boolean;
  created_at: number;
  userWorkedOn: boolean;
}

interface Contact {
  firstContact: FirstContact;
}

interface FirstContact {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  title: string;
  phone: string;
}
