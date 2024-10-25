import type { AdvancedFilterAction, AdvancedFilterCondition } from '$lib/client/services/settings';
import type { DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';

export type SystemInfo = {
  partitionsInfo: PartitionsInfo[];
  availableProcessors: number;
  totalMemory: number;
  roots: Root[];
  osName: string;
  maxMemory: number;
  freeMemory: number;
};
type PartitionsInfo = {
  mounted: string;
  usedPercentage: number;
  available: string;
  used: string;
  size: string;
  fileSystem: string;
};
type Root = {
  path: string;
};

export type Version = {
  version: string;
  gitHash: string;
  buildDate: string;
  branch: string;
};

export interface Online {
  lastAccessedTime: string;
  creationTime: string;
  username: string;
}

export interface Rss {
  name: string;
}

export interface SupportedTldResponse {
  total_resources: number;
  list: SupportedTld[];
}

export interface SupportedTld {
  data: SupportedTldData;
  source: string;
  dataSourceQuality: string;
  updateFrequency: string;
  lastUpdated: null | string;
}

export interface SupportedTldData {
  name: string;
  description: null | string;
  tldPunyCode: string;
  whoisValidation: boolean;
}

export type SyncClientResult = {
  failed: [];
  not_contracted: string[];
  ok: string[];
};

export type FilterTemplateResponse = {
  filterTemplates: FilterTemplate[];
  totalRegistres: number;
};

export type FilterTemplate = {
  id: number;
  name: string;
  superSearchId: number;
  superSearchName: string;
  conditions: AdvancedFilterCondition[];
  actions: AdvancedFilterAction[];
  inUse: boolean;
};

export type ChartsResponse = {
  total_resources: number;
  list: ChartListItem[];
};

export type ChartListItem = {
  id: number;
  organizationId: number;
  organizationName: string;
  moduleId: number;
  moduleName: string;
  moduleShortName: string;
  title: string;
  graphicDataGenId: number;
  graphicStyleId: number;
  type: number;
  isPrivate: boolean;
  graphicConfigurationTemplateId: number;
  complete: boolean;
};

export interface ChartItem {
  id: number;
  title: string;
  graphicDataGenId: number;
  graphicStyleId: number;
  organizationId: number;
  moduleId: number;
  type: number;
  isPrivate: boolean;
  values: {
    paramId: number;
    value: string;
  }[];
}

export interface ChartDataGenResponse {
  total_datagens: number;
  list: ChartDataGen[];
}

export interface ChartDataGen {
  id: number;
  name: string;
  classname: string;
  nameKey: string;
  params: any[];
  styleCompatibilities: StyleCompatibility[];
}

export interface StyleCompatibility {
  id: number;
  name: string;
  classname: string;
  nameKey: string;
}

export interface ChartDataGenParamResponse {
  param: ChartDataGenParam;
  paramOptions?: ChartDataGenParamOption[];
}

export interface ChartDataGenParam {
  id: number;
  graphicDataGenId: number;
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
  inputType: string;
  descriptionKey: string;
  dataUrl?: string;
}

export interface ChartDataGenParamOption {
  key: string;
  value: string;
}

export type UserResponse = {
  total_resources: number;
  list: User[];
};

export type User = {
  id: number;
  name: string;
  firstSurname: string;
  secondSurname: string;
  email: string;
  username: string;
  job: string;
  status: 'ENABLED' | 'DISABLED' | 'PASSWORD_EXPIRED' | 'LOCKED' | 'EXPIRED';
  lastIpAddress: null;
  lastLoginAt: number;
  masterGrant: string;
  hasMFA: boolean;
  daysToPasswordChange: number;
};

export type Grant = {
  master: boolean;
  mssp_admin: boolean;
  sales: boolean;
  superSearchGrants: OrganizationSearchGrant[];
  superadmin: boolean;
  trial: boolean;
  userId: number;
  username: string;
};

export type OrganizationSearchGrant = {
  itemId: number;
  analyst: boolean;
  operator: boolean;
  mssp_customer: boolean;
  reputationalSearchGrants?: ModuleSearchGrant[];
};

export type ModuleSearchGrant = {
  itemId: number;
  analyst: boolean;
  operator: boolean;
  mssp_customer: boolean;
};

export type UserPayload = {
  id: number;
  name: string;
  firstSurname: string;
  secondSurname: string;
  email: string;
  username: string;
  password: string;
  address: string;
  telephone: string;
  cellphone: string;
  job: string;
  expirationTime: string;
  timezone: string;
  grants: Grant;
  customerId: number;
  api: boolean;
};

export type UserDetail = UserPayload & {
  companiesId: string;
  internalUser: boolean;
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
};

export type UserGroup = {
  id: number;
  name: string;
};

export type UserGroupDetail = {
  id: number;
  name: string;
  userMap: Record<number, UserDetail>;
  users: null;
};

export type ConfigurationPropertyResponse = {
  list: ConfigurationProperty[];
  total_properties: number;
};

export type ConfigurationProperty = {
  id: number;
  name: string;
  value: string;
};

export type LabelResponse = {
  total_resources: number;
  list: Label[];
};
export type BlacklistResponse = {
  totalRegistres: number;
  blacklist: Blacklist[];
};
export type Blacklist = {
  id: number;
  url: string;
  createdAt: number;
  updatedAt: number;
  superSearchId: number;
};
export type Label = {
  id: number;
  label: string;
  organizationId: number | null;
  organizationName: null | string;
  moduleId: number | null;
  moduleName: null | string;
  labelTypeId: number | null;
  labelTypeName: null | string;
  labelProtected: boolean;
  prioritized: boolean;
  bgColorHex: string;
  textColorHex: string;
  moduleTypeId: null;
};

export type LabelType = {
  id: number;
  name: string;
};

export type Plugin = {
  name: string;
  type: string;
  language: string;
  contentData: string;
  enabled: boolean;
  visionEnabled: boolean;
  visionSchedExpression: string | null;
  minExecutionDelay: number | null;
  inputs: string[];
  outputs: string[];
  createdAt: number;
  updatedAt: number;
  pluginGroupsStr: null;
  blueliv: boolean;
  credits: number;
  globalExecution: boolean;
  afapi: boolean;
  inputsAsString: string;
  outputsAsString: string;
};

export interface PluginResponse {
  total_resources: number;
  list: PluginItem[];
}

export interface PluginItem {
  name: string;
  type: string;
  language: string;
  enabled: boolean;
  visionEnabled: boolean;
  inputs: string[];
  outputs: string[];
  updatedAt: number;
  credits: number;
}

export type AccessLogQuery = {
  p: true;
  page: number;
  maxRows: number;
  o?: string;
  user?: string;
  resource?: string;
  since?: number;
  to?: number;
};

export interface AccessLogResponse {
  totalRegistres: number;
  accessLogs: AccessLog[];
}

export interface AccessLog {
  createdAt: number;
  ipaddress: string;
  username: string;
  section: string;
  action: string;
}

export interface InExecutionJobResponse {
  total: number;
  jobs: InExecutionJob[];
}

export interface InExecutionJob {
  transformName: string;
  organizationId: number;
  organizationName: string;
  moduleId: number;
  moduleName: string;
  searchPhraseId: number;
  wordPluginId: number;
  searchPhrase: string;
  enqueuedAt: number;
  startTime: number;
  automatic: boolean;
  stopTime: null;
}

export interface ScheduledJobResponse {
  total: number;
  jobs: ScheduledJob[];
}

export interface ScheduledJob {
  transformName: string;
  organizationId: number;
  organizationName: string;
  moduleId: number;
  moduleName: string;
  searchPhraseId: number;
  searchPhrase: string;
  schedulingExpression: string;
  nextExecutionDate: number;
  id: number;
}

export type SearchCatalogQuery = {
  page: number;
  maxRows: number;
  customerId: number;
  search?: string;
  sortKey?: string;
  sortDirection?: DataTableProps['sortDirection'];
};

export interface IncidentCatalogResponse {
  content: IncidentCatalog[];
  totalElements: number;
}

export interface IncidentCatalog {
  id: number;
  name: string;
  customerId: number;
  customerName: string;
  incidents: Incident[];
  associated: number;
  created: string;
}

export interface Incident {
  id: number;
  type: string;
  description: string;
  remediationTips: string;
  risk: string;
  attCk: null;
  moduleTypes: string[];
  createdAt: string;
  updatedAt: string;
  catalogId: number;
}

export type SearchCustomersQuery = {
  page: number;
  maxRows: number;
  search?: string;
  sortKey?: string;
  sortDirection?: DataTableProps['sortDirection'];
};

export type CustomerResponse = {
  content: Customer[];
  totalElements: number;
};

export interface Customer {
  id: number;
  name: string;
  customerType: CustomerType;
  active: boolean;
  contract: Contract;
  customerModules: CustomerModule[];
  enforcing: boolean;
  customerTypeId: number;
  total: CustomerTotal;
  trials: number;
  limits: number;
}

export interface Contract {
  id: number;
  startAt: string;
  endAt: string;
  band: Band;
  bandValues: BandValues;
  isBincodes: boolean;
  contractsModules: ContractsModule[];
  bandId: number;
  customerId: number;
}

export interface Band {
  id: number;
  name: string;
  bandValues: BandValues;
}

export interface BandValues {
  binCodes?: number;
  cpes?: number;
  creditCardsPerYear?: number;
  emails?: number;
  employees?: number;
  ips?: number;
  keywords?: number;
  rootDomains?: number;
  storage?: string;
}

export interface ContractsModule {
  id: number;
  moduleType: string;
  total: string;
  contractId: number;
  rootDomains?: number;
  ips?: number;
  creditCardsPerYear?: number;
  binCodes?: number;
  keywords?: number;
  emails?: number;
  cpes?: number;
  storage?: string;
}

export interface HTTPSTcpreProductionBluelivCOM {
  rootDomains: number;
  keywords?: number;
  ips?: number;
}

export interface CustomerModule {
  id: number;
  instanceModuleId: number;
  instance: string;
  link: string;
  moduleType: string;
  invoicing: boolean;
  active: boolean;
  deleted: boolean;
  moduleValues?: ModuleValues;
  customerId: number;
  trial: boolean;
  schedule: boolean;
}

export interface ModuleValues {
  rootDomains?: number;
  ips?: number;
  keywords?: number;
  binCodes?: number;
  emails?: number;
  creditCardsPerYear?: number;
  cpes?: number;
  storage?: string;
}

export interface CustomerType {
  id: number;
  name: string;
}

export interface CustomerTotal {
  rootDomains: number;
  ips: number;
  creditCardsPerYear: number;
  binCodes: number;
  keywords: number;
  emails: number;
  cpes: number;
  storage?: string;
}
