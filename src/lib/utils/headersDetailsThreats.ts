import type { ModuleNameType } from '$lib/constants/modules';
import type { ResourceDetail } from '$lib/types/resource';
import {
  Code,
  Debug,
  Document,
  FolderOpen,
  Identification,
  Laptop,
  Locked,
  Router,
  Star,
  Time,
  UserFilled
} from 'carbon-icons-svelte';
import type { SvelteComponent } from 'svelte';
import { getHumanReadableDate } from './functions';
import { resourcesTypesDictionary } from './parseData';

export type HeaderKey = {
  key?: string;
  name: string;
  value?: keyof ResourceDetail;
  display?: (detail: ResourceDetail) => string | boolean | number;
  show?: (detail: ResourceDetail) => boolean;
  icon?: typeof SvelteComponent<any>;
  tooltip: string;
  isUrl?: boolean;
  isCopy?: boolean;
};

export const THREAT_TOOLTIPS = {
  rating: 'Rating assigned for the user to a threat',
  username: 'Unique identifier that was compromised',
  password: 'Password compromised',
  botnetType:
    'Categorization of a botnet, that is a network of compromised devices controlled by a single entity and control server',
  affectedUrl: 'URL where the stolen credentials were originally used',
  credentialType: 'Classification of compromised credentials: Botnet, Hacktivism or BotIP',
  classification: 'Classification based on the setting in the classify tab',
  email: 'Indicates if the username of the crendential and the email configured in the EMAILS setting, match',
  updatedAt: 'When the platform updates the result due to a change',
  reportedAt: 'Result discovery date on the platform',
  breachedDate: 'Credential Compromise Date',
  affectedBank: 'Bank Affected by Stolen Credit Card',
  cardsFound: 'Quantity of Compromised Credit Cards',
  sources: 'Malware that has stolen the credential',
  date: 'Batch upload date',
  contentType: 'Result format',
  URL: 'Web address that specifies the location of the result on the internet',
  file: 'File where the result was found',
  relevance: 'TYP: To classify the threat status as informative, negative, positive, or not important',
  title: '',
  domainType: '',
  origin: '',
  labels: '',
  botip: '',
  leakFoundAt: '',
  isEmail: '',
  searchWords: '',
  language: '',
  country: '',
  submitted: '',
  fileType: '',
  architecture: '',
  size: '',
  malware: '',
  severity: '',
  md5: '',
  sha1: '',
  sha256: '',
  ssdeep: ''
};

export const headerDetailsThreats: Partial<Record<ModuleNameType, HeaderKey[][]>> = {
  credential: [
    // https://blueliv.atlassian.net/wiki/spaces/PBD/pages/3944972297/Credentials
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      {
        name: 'USERNAME',
        display: (detail) => detail.credential?.username ?? 'Not available',
        show: (detail) =>
          detail.resourceType === resourcesTypesDictionary.BOTNET_CREDENTIALS ||
          detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
        tooltip: THREAT_TOOLTIPS.username,
        icon: UserFilled
      },
      {
        key: 'password',
        name: 'PASSWORD',
        show: (detail) =>
          detail.resourceType === resourcesTypesDictionary.BOTNET_CREDENTIALS ||
          detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
        tooltip: THREAT_TOOLTIPS.password
      },
      {
        name: 'BOTIP',
        display: (detail) => detail.credential?.botIp ?? 'Not available',
        show: (detail) => detail.resourceType === resourcesTypesDictionary.BOTIP,
        tooltip: THREAT_TOOLTIPS.botip
      },
      {
        key: 'credential.type',
        name: 'BOTNET TYPE',
        show: (detail) => detail.resourceType === resourcesTypesDictionary.BOTNET_CREDENTIALS,
        tooltip: THREAT_TOOLTIPS.botnetType
      },
      {
        name: 'DOMAIN / URL',
        display: (detail) => detail.credential?.portalUrl || 'Not available',
        show: (detail) => detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
        tooltip: THREAT_TOOLTIPS.URL
      },
      {
        key: 'credential.email',
        name: 'EMAIL',
        display: (detail) => detail.credential?.email || 'Not available',
        show: (detail) => detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
        tooltip: THREAT_TOOLTIPS.email
      },
      {
        name: 'LEAK FOUND AT',
        isUrl: true,
        display: (detail) => detail.credential?.sources?.[0],
        show: (detail) => detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
        tooltip: THREAT_TOOLTIPS.leakFoundAt
      },
      {
        name: 'AFFECTED URL',
        isUrl: true,
        display: (detail) => detail.credential?.portalUrl,
        show: (detail) =>
          detail.resourceType === resourcesTypesDictionary.BOTNET_CREDENTIALS ||
          detail.resourceType === resourcesTypesDictionary.BOTIP,
        tooltip: THREAT_TOOLTIPS.affectedUrl
      },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'CREDENTIAL TYPE', value: 'resourceType', icon: Star, tooltip: THREAT_TOOLTIPS.credentialType },
      {
        name: 'CLASSIFICATION',
        display: (detail) => detail.credential?.classification ?? '-',
        tooltip: THREAT_TOOLTIPS.classification
      },
      {
        key: 'credential.isEmail',
        name: 'IS EMAIL',
        tooltip: THREAT_TOOLTIPS.isEmail
      },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt },
      {
        key: 'credentialReportedAt',
        name: 'REPORTED AT',
        icon: Debug,
        tooltip: THREAT_TOOLTIPS.reportedAt,
        display: (detail) => getHumanReadableDate(detail?.credential?.reportedAt, 'Unknown')
      },
      {
        key: 'credentialBreachedAt',
        name: 'BREACHED AT',
        icon: Debug,
        tooltip: THREAT_TOOLTIPS.breachedDate,
        display: (detail) => getHumanReadableDate(detail?.credential?.stolenData?.[0]?.stolenAt, 'Unknown')
      }
    ]
  ],
  media_tracker: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
      { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
      { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
      { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
      { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
      { name: 'TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
      { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
      { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
    ]
  ],
  credit_card: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'AFFECTED BANK', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.affectedBank },
      { name: 'CARDS FOUND', value: 'numCards', icon: Identification, tooltip: THREAT_TOOLTIPS.cardsFound },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'SOURCES', value: 'sources', tooltip: THREAT_TOOLTIPS.sources },
      { name: 'DATE', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.date },
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance }
    ]
  ],
  hacktivism: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
      { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
      { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
      { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
      { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
      { name: 'TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
      { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
      { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
    ]
  ],
  domain_protection: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
      { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
      { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
      { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
      { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
      { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
      { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
      { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
    ]
  ],
  data_leakage: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
      { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
      { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
      { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
      { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
      { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
      { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
      { name: 'DOMAIN TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
      { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
    ]
  ],
  dark_web: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
      { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
      { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
      { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin }
    ],
    [
      { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
      { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
      { name: 'DOMAIN TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
      { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
    ]
  ],
  social_media: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
      { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
      { name: 'FILE', value: 'file', tooltip: THREAT_TOOLTIPS.file },
      { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
      { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
      { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
      { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
      { name: 'TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
      { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
    ]
  ],
  custom: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
      { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
      { name: 'FILE', value: 'file', tooltip: THREAT_TOOLTIPS.file },
      { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
      { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
      { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
      { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
      { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
      { name: 'DOMAIN TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
      { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
    ]
  ],
  malware: [
    [
      { name: 'SUBMITTED', value: 'submitted', icon: Time, tooltip: THREAT_TOOLTIPS.submitted },
      { name: 'FILE TYPE', value: 'fileType', icon: FolderOpen, tooltip: THREAT_TOOLTIPS.fileType },
      { name: 'ARCHITECTURE', value: 'architecture', icon: Laptop, tooltip: THREAT_TOOLTIPS.architecture },
      { name: 'SIZE', value: 'size', icon: Router, tooltip: THREAT_TOOLTIPS.size },
      { name: 'MALWARE', value: 'malwareType', icon: Debug, tooltip: THREAT_TOOLTIPS.malware },
      { name: 'SEVERITY', value: 'severity', tooltip: THREAT_TOOLTIPS.severity },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'MD5', value: 'md5', icon: Locked, isCopy: true, tooltip: THREAT_TOOLTIPS.md5 },
      { name: 'SHA1', value: 'sha1', icon: Locked, isCopy: true, tooltip: THREAT_TOOLTIPS.sha1 },
      { name: 'SHA256', value: 'sha256', icon: Locked, isCopy: true, tooltip: THREAT_TOOLTIPS.sha256 },
      { name: 'SSDEEP', value: 'ssdeep', icon: Locked, isCopy: true, tooltip: THREAT_TOOLTIPS.ssdeep },
      { name: 'SEARCH WORDS', icon: Document, value: 'searchPhrase', tooltip: THREAT_TOOLTIPS.searchWords }
    ]
  ],
  mobile_apps: [
    [
      { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
      { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
      { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
      { name: 'FILE', value: 'file', tooltip: THREAT_TOOLTIPS.file },
      { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
      { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
      { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels }
    ],
    [
      { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
      { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
      { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
      { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
      { name: 'DOMAIN TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
      { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
      { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
    ]
  ]
};

export const headerPreviewThreats: Partial<Record<ModuleNameType, HeaderKey[]>> = {
  credential: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    {
      name: 'USERNAME',
      display: (detail) => detail.credential?.username ?? 'Not available',
      show: (detail) =>
        detail.resourceType === resourcesTypesDictionary.BOTNET_CREDENTIALS ||
        detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
      tooltip: THREAT_TOOLTIPS.username
    },
    {
      key: 'password',
      name: 'PASSWORD',
      show: (detail) =>
        detail.resourceType === resourcesTypesDictionary.BOTNET_CREDENTIALS ||
        detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
      tooltip: THREAT_TOOLTIPS.password
    },
    {
      name: 'BOTIP',
      display: (detail) => detail.credential?.botIp ?? 'Not available',
      show: (detail) => detail.resourceType === resourcesTypesDictionary.BOTIP,
      tooltip: THREAT_TOOLTIPS.botip
    },
    {
      key: 'credential.type',
      name: 'BOTNET TYPE',
      show: (detail) => detail.resourceType === resourcesTypesDictionary.BOTNET_CREDENTIALS,
      tooltip: THREAT_TOOLTIPS.botnetType
    },
    {
      name: 'DOMAIN / URL',
      display: (detail) => detail.credential?.portalUrl || 'Not available',
      show: (detail) => detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
      tooltip: THREAT_TOOLTIPS.URL
    },
    {
      key: 'credential.email',
      name: 'EMAIL',
      display: (detail) => detail.credential?.email || 'Not available',
      show: (detail) => detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
      tooltip: THREAT_TOOLTIPS.email
    },
    {
      name: 'LEAK FOUND AT',
      isUrl: true,
      display: (detail) => detail.credential?.sources?.[0],
      show: (detail) => detail.resourceType === resourcesTypesDictionary.HACKTIVISM_CREDENTIALS,
      tooltip: THREAT_TOOLTIPS.leakFoundAt
    },
    {
      name: 'AFFECTED URL',
      isUrl: true,
      display: (detail) => detail.credential?.portalUrl,
      show: (detail) =>
        detail.resourceType === resourcesTypesDictionary.BOTNET_CREDENTIALS ||
        detail.resourceType === resourcesTypesDictionary.BOTIP,
      tooltip: THREAT_TOOLTIPS.affectedUrl
    },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'CREDENTIAL TYPE', value: 'resourceType', icon: Star, tooltip: THREAT_TOOLTIPS.credentialType },
    {
      name: 'CLASSIFICATION',
      display: (detail) => detail.credential?.classification ?? '-',
      tooltip: THREAT_TOOLTIPS.classification
    },
    {
      key: 'credential.isEmail',
      name: 'IS EMAIL',
      tooltip: THREAT_TOOLTIPS.isEmail
    },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt },
    {
      key: 'credentialReportedAt',
      name: 'REPORTED AT',
      icon: Debug,

      tooltip: THREAT_TOOLTIPS.reportedAt,
      display: (detail) => getHumanReadableDate(detail?.credential?.reportedAt, 'Unknown')
    },
    {
      key: 'credentialBreachedAt',
      name: 'BREACHED AT',

      icon: Debug,
      tooltip: THREAT_TOOLTIPS.breachedDate,
      display: (detail) => getHumanReadableDate(detail?.credential?.stolenData?.[0]?.stolenAt, 'Unknown')
    }
  ],
  media_tracker: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
    { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
    { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
    { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
    { name: 'TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
    { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
    { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
  ],
  credit_card: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'AFFECTED BANK', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.affectedBank },
    { name: 'CARDS FOUND', value: 'numCards', icon: Identification, tooltip: THREAT_TOOLTIPS.cardsFound },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'SOURCES', value: 'sources', tooltip: THREAT_TOOLTIPS.sources },
    { name: 'DATE', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.date },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance }
  ],
  hacktivism: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
    { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
    { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
    { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
    { name: 'TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
    { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
    { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
  ],
  domain_protection: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
    { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
    { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
    { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
    { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
    { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
    { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
  ],
  data_leakage: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
    { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
    { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
    { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
    { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
    { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
    { name: 'DOMAIN TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
    { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
  ],
  dark_web: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
    { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
    { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
    { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
    { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
    { name: 'DOMAIN TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
    { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
  ],
  social_media: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
    { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
    { name: 'FILE', value: 'file', tooltip: THREAT_TOOLTIPS.file },
    { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
    { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
    { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
    { name: 'TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
    { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
  ],
  custom: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
    { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
    { name: 'FILE', value: 'file', tooltip: THREAT_TOOLTIPS.file },
    { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
    { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
    { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
    { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
    { name: 'DOMAIN TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
    { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
  ],
  malware: [
    { name: 'SUBMITTED', value: 'submitted', icon: Time, tooltip: THREAT_TOOLTIPS.submitted },
    { name: 'FILE TYPE', value: 'fileType', icon: FolderOpen, tooltip: THREAT_TOOLTIPS.fileType },
    { name: 'ARCHITECTURE', value: 'architecture', icon: Laptop, tooltip: THREAT_TOOLTIPS.architecture },
    { name: 'SIZE', value: 'size', icon: Router, tooltip: THREAT_TOOLTIPS.size },
    { name: 'MALWARE', value: 'malwareType', icon: Debug, tooltip: THREAT_TOOLTIPS.malware },
    { name: 'SEVERITY', value: 'severity', tooltip: THREAT_TOOLTIPS.severity },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'MD5', value: 'md5', icon: Locked, isCopy: true, tooltip: THREAT_TOOLTIPS.md5 },
    { name: 'SHA1', value: 'sha1', icon: Locked, isCopy: true, tooltip: THREAT_TOOLTIPS.sha1 },
    { name: 'SHA256', value: 'sha256', icon: Locked, isCopy: true, tooltip: THREAT_TOOLTIPS.sha256 },
    { name: 'SSDEEP', value: 'ssdeep', icon: Locked, isCopy: true, tooltip: THREAT_TOOLTIPS.ssdeep },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchPhrase', tooltip: THREAT_TOOLTIPS.searchWords }
  ],
  mobile_apps: [
    { name: 'RATING', value: 'rating', tooltip: THREAT_TOOLTIPS.rating },
    { name: 'TITLE', value: 'title', icon: Identification, tooltip: THREAT_TOOLTIPS.title },
    { name: 'URL', value: 'url', isUrl: true, tooltip: THREAT_TOOLTIPS.URL },
    { name: 'FILE', value: 'file', tooltip: THREAT_TOOLTIPS.file },
    { name: 'COUNTRY', value: 'selectedCountry', tooltip: THREAT_TOOLTIPS.country },
    { name: 'LANGUAGE', value: 'languageId', tooltip: THREAT_TOOLTIPS.language },
    { name: 'LABELS', value: 'labels', tooltip: THREAT_TOOLTIPS.labels },
    { name: 'RELEVANCE', value: 'analysisCalcResult', tooltip: THREAT_TOOLTIPS.relevance },
    { name: 'ORIGIN', value: 'transform', tooltip: THREAT_TOOLTIPS.origin },
    { name: 'SEARCH WORDS', icon: Document, value: 'searchWordsViewDetails', tooltip: THREAT_TOOLTIPS.searchWords },
    { name: 'CONTENT TYPE', value: 'contentType', icon: Code, tooltip: THREAT_TOOLTIPS.contentType },
    { name: 'DOMAIN TYPE', value: 'domainType', tooltip: THREAT_TOOLTIPS.domainType },
    { name: 'REPORTED AT', value: 'createdAt', icon: Time, tooltip: THREAT_TOOLTIPS.reportedAt },
    { name: 'UPDATED AT', value: 'changedAt', icon: Time, tooltip: THREAT_TOOLTIPS.updatedAt }
  ]
};
