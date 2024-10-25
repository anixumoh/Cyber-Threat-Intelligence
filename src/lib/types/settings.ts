export type FiltersType = {
  enabled: boolean;
  filterTemplateId: any;
  filterTemplateName: any;
  generated: boolean;
  hasAlertAction: boolean;
  id: number;
  name: string;
  order: number;
  status: string;
};

export type FilterCommonType = {
  enabled: boolean;
  generated: boolean;
  id: number;
  name: string;
  order: number;
  status: string;
};

export type FilterType = FilterCommonType & {
  actions: FilterActionType[];
  conditions: FilterConditionType[];
};

export type FilterConditionType = {
  id: number;
  type: string;
  value: any;
  inverse: boolean;
  origins: any[];
  parsedValue?: any;
};

export type FilterActionType = {
  id: number;
  type: string;
  value?: any;
  alertConfiguration?: AlertConfiguration;
};

export type AlertConfiguration = {
  filterActionId: number;
  threshold: number;
  interval: number;
  sendAlert: boolean;
  destinations?: any[];
  alertContentFields?: ContentAlertItemType[];
};

export type ContentAlertItemType = {
  name: string;
  enable: boolean;
  key?: string;
};

export type ModulesType =
  | 'CUSTOM'
  | 'DOMAIN_PROTECTION'
  | 'CREDIT_CARDS_FULL'
  | 'MOBILE_APPS'
  | 'CREDENTIALS'
  | 'DATA_LEAKAGE'
  | 'SOCIAL_MEDIA'
  | 'HACKTIVISM'
  | 'MEDIA_TRACKER'
  | 'DARK_WEB'
  | 'THREAT_CONTEXT'
  | 'EXPLORER';

export type ContentAlertResponseType<T extends ModulesType> = {
  [key in T]: ContentAlertItemType[];
};

export type Contentype = {
  defaultResponse: ContentAlertResponseType<ModulesType>;
  response: ContentAlertResponseType<ModulesType>;
  contentSplited: ContentAlertItemType[][];
  selected: number[];
  editing: boolean;
  sendAlert?: boolean;
};

export type ConfiguredType = {
  cursorMark: string;
  enabled: boolean;
  fromId: unknown;
  id: number;
  lastExecution: Date | string;
  lastExecutionWithNewResults: Date | string;
  pluginId: string;
  reputationalSearchWordId: number;
  visionSchedExpression: string;
  available?: boolean;
  key?: string;
  name?: string;
};

export type TermsListType = {
  configured: ConfiguredType[];
  crawler: boolean;
  createdAt: Date;
  extraConfig: unknown;
  hasError: boolean;
  id: number;
  reputationalSearchId: number;
  reputationalSearchName: string;
  reputationalSearchTopicName: string;
  runAt: unknown;
  searchEngines: boolean;
  searchFacebook: boolean;
  searchImageContentType: unknown;
  searchImageFilename: unknown;
  searchPhrase: string;
  searchTwitter: boolean;
  strict: boolean;
  termType: string;
  extraField?: unknown;
  image?: unknown;
};

export type RSSResponse = {
  values: Rss[];
  total: number;
};

export type Rss = {
  id: number;
  name: string;
  url: string;
  rssFeedTypeId: number;
  rssFeedTypeName: string;
  createdAt: number;
  runAt: number | null;
  enabled: boolean;
  automatic: boolean;
  reputationalSearchWordsId: null;
};

export type RssTypeResponse = {
  totalRegistres: number;
  rssFeedType: RssType[];
};

export type RssType = {
  id: number;
  name: string;
  plugin?: string;
};

export type RssFields = {
  name: string;
  rssFeedTypeId: number;
  url: string;
};
