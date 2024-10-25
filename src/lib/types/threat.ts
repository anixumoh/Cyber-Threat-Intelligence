export enum AnalysisCalcResultType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  INFORMATIVE = 'INFORMATIVE',
  NOT_IMPORTANT = 'NOT_IMPORTANT'
}

export enum ReadStatusOptions {
  ALL = 0,
  READ = 1,
  NOT_READ = 2
}

export enum ModifiedStatusOptions {
  ALL = 'ALL',
  MODIFIED = 'MODIFIED',
  NON_MODIFIED = 'NON_MODIFIED'
}

export type ThreatFilterType = {
  read: ReadStatusOptions;
  modified: ModifiedStatusOptions;
  starred?: boolean;
  incidents?: boolean;
  followed?: boolean;
  labels: number[];
  labelsAnd: number[];
  excludeLabels: number[];
  terms: number[];
  sources: string[];
  analysisCalcResult: AnalysisCalcResultType[];
  status?: number;
  targeted?: boolean;
  userSubmitted?: boolean;
};

export type ThreatSearchType = ResetThreatsFiltersType & {
  page: number;
  o?: string;
  days?: number;
  q?: string;
  filters: ThreatFilterType;
  forceUpdate: number;
};

export type MessageObjType = {
  msg: string;
  count?: number | string;
};

export enum ThreatDateFilterField {
  UPDATED_AT = 0,
  BREACHED_AT = 1
  // REPORTED_AT = 2
}

export type ResetThreatsFiltersType = {
  maxRows: number;
  dateField?: ThreatDateFilterField;
  since?: Date;
  to?: Date;
};

export type ThreatDetail = {
  email?: number;
  employee?: number;
  customer?: number;
  external?: number;
  num_cred?: number;
  resource_type?: string;
  id: number;
  module_id?: number;
  module_name?: string;
  module_short_name?: string;
  module_type?: string;
  title?: string;
  created_at?: Date;
  checked_at?: Date;
  changed_at?: Date;
  user_rating?: number;
  read?: boolean;
  readed?: boolean;
  fav?: 'USER_STARRED' | 'NOT_STARRED';
  issued?: boolean;
  tlpStatus?: string;
  searchPhrase?: string;
  followedUp?: boolean;
  userModified?: boolean;
  history?: any[];
  url?: string;
  file_name?: string;
  analysis_calc_result?: string;
  analysis_user_result?: string;
  updated_at?: Date;
  labels?: any[];
  search_words?: string[];
  sourceType?;
  language_id?;
  num_cards?;
  targeted?;
  status?;
  platform?;
  file_size?;
  upload_date?;
  av_ratio?;
  severity?;
  countries_id?;
  transform?;
  domain_type?;
  sources?;
  content_type?;
  file?;
  domain?;
  malwareType?;
  total_retweets?: number;
  retweet_info?: any[];
  metadata?: any;
  credential?: Credential;
  credentials?;
  credit_cards?;
  leakFoundAt?: string;
  leakOrigin?: string;
  leakDate?: any;
  uploadDate?: any;
  affectedFields?: any[];
  summary?: any;
  submitted?: string;
  architecture?: string;
  size?: string;
  fileType?: string;
  md5?: string;
  sha1?: string;
  sha256?: string;
  ssdeep?: string;
  network?: NetworkType;
  header?: headerType;
  staticc?: staticcType;
  dropped?: any;
  behavior?: any;
};

type Credential = {
  id: string;
  botIp?: string;
  username?: string;
  stolenData?: StolenData[];
  classification: string;
  firstReportedAt: number;
  isEmail?: boolean;
  lastReportedAt: number;
  password: string;
  portalUrl?: string;
  reportedAt?: number;
  reportedCount: number;
  type?: string;
  userPassword?: string;
  domainUrl?: string;
  email?: string;
  sources?: string[];
};

export type StolenData = {
  stolenAt?: number;
  botCity?: string;
  botCountry?: string;
  botCountryName?: string;
  botLatitude?: number;
  botLongitude?: number;
};

type NetworkType = {
  domains: any[];
  hosts: any[];
  http: any[];
  dns: any[];
  protocols: any;
};

type headerType = {
  packer: string;
  yara: string;
};

type staticcType = {
  type: 'office' | 'pdf' | 'exe' | 'zip';
  pe_sections: any[];
  compressed_files: any;
  pe_imports: any[];
  office: any;
  pdf: any;
};

export type PanintelligenceDashboardInfoResponse = {
  token: string;
  baseUrl: string;
  loginUri: string;
  chartsUris: string[];
};
