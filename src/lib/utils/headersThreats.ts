import type {
  DataTableNonEmptyHeader,
  DataTableEmptyHeader
} from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
import type { Resource } from '$lib/types/resource';
import { getHumanReadableDate } from './functions';
import { UNKNOWN } from '$lib/constants/text';
import { MODULE_NAME, type ModuleNameType } from '$lib/constants/modules';

interface ThreatDataTableNonEmptyHeader extends DataTableEmptyHeader {
  display?: (resource: Resource) => string;
}
interface ThreatDataTableEmptyHeader extends DataTableNonEmptyHeader {
  display?: (resource: Resource) => string;
}
type ThreatDataTableHeader = ThreatDataTableNonEmptyHeader | ThreatDataTableEmptyHeader;

const ACTIONS_LARGE: ThreatDataTableHeader = { key: 'actions', value: 'ACTIONS', sort: false, width: '200px' };
const ACTIONS_SHORT: ThreatDataTableHeader = { key: 'actions', value: 'ACTIONS', sort: false, width: '120px' };

const headersMultiple: ThreatDataTableHeader[] = [
  { key: 'rating', value: 'RATING', width: '120px' },
  { key: 'searchPhrase', value: 'SEARCH WORD', sort: false, width: '100px' },
  { key: 'changedAt', value: 'UPDATED AT', width: '85px' },
  { key: 'relevance', value: 'RELEVANCE', width: '90px' },
  ACTIONS_LARGE
];

const headersCommons: ThreatDataTableHeader[] = [
  { key: 'title', value: 'TITLE', width: '36%' },
  { key: 'rating', value: 'RATING', width: '120px' },
  { key: 'changedAt', value: 'UPDATED AT', width: '80px' },
  { key: 'relevance', value: 'RELEVANCE', width: '90px' },
  ACTIONS_LARGE
];

const headersHacktivism: ThreatDataTableHeader[] = [...headersCommons];

const headersCredentials: ThreatDataTableHeader[] = [
  { key: 'title', value: 'TITLE', width: '120px' },
  { key: 'resourceType', value: 'TYPE', width: '80px', sort: false },
  { key: 'rating', value: 'RATING', width: '120px' },
  { key: 'credential.isEmail', value: 'EMAIL', width: '80px', sort: false },
  { key: 'changedAt', value: 'UPDATED AT', width: '90px' },
  {
    key: 'credential.stolenData.stolenAt',
    value: 'BREACHED AT',
    sort: false,
    display: (detail) => getHumanReadableDate(detail.credential?.stolenData?.[0]?.stolenAt, UNKNOWN),
    width: '80px'
  },
  {
    key: 'classification',
    value: 'CLASSIFICATION',
    sort: false,
    display: (detail) => detail.credential?.classification ?? '-',
    width: '120px'
  },
  ACTIONS_SHORT
];

const headersSocialMedia: ThreatDataTableHeader[] = [
  { key: 'title', value: 'TITLE', width: '25%' },
  ...headersMultiple
];

const headersCustom: ThreatDataTableHeader[] = [
  { key: 'title', value: 'TITLE', width: '36%' },
  { key: 'rating', value: 'RATING', width: '120px' },
  { key: 'changedAt', value: 'UPDATED AT', width: '80px' },
  { key: 'relevance', value: 'RELEVANCE', width: '90px' },
  ACTIONS_LARGE
];

const headersDarkWeb: ThreatDataTableHeader[] = [
  { key: 'title', value: 'TITLE', width: '30%' },
  { key: 'rating', value: 'RATING', width: '120px' },
  { key: 'searchWords', value: 'SEARCH WORD', sort: false, width: '100px' },
  { key: 'changedAt', value: 'UPDATED AT', width: '85px' },
  { key: 'relevance', value: 'RELEVANCE', width: '90px' },
  ACTIONS_LARGE
];

const headersCreditCard: ThreatDataTableHeader[] = [
  { key: 'title', value: 'AFFECTED BANKS', width: '36%' },
  { key: 'rating', value: 'RATING', width: '120px' },
  { key: 'numCards', value: 'NUM. CARDS', sort: false, width: '12%' },
  { key: 'changedAt', value: 'UPDATED AT', width: '80px' },
  { key: 'relevance', value: 'RELEVANCE', width: '90px' },
  ACTIONS_SHORT
];

const headersDataLeakage: ThreatDataTableHeader[] = [
  { key: 'title', value: 'TITLE', width: '30%' },
  { key: 'rating', value: 'RATING', width: '120px' },
  { key: 'searchWords', value: 'SEARCH WORD', sort: false, width: '100px' },
  { key: 'changedAt', value: 'UPDATED AT', width: '85px' },
  { key: 'relevance', value: 'RELEVANCE', width: '90px' },
  ACTIONS_LARGE
];

const headersMediaTracker: ThreatDataTableHeader[] = [
  { key: 'title', value: 'TITLE', width: '30%' },
  ...headersMultiple
];

const headersDomainProtection: ThreatDataTableHeader[] = [
  { key: 'title', value: 'TITLE', width: '25%' },
  ...headersMultiple
];

const headersMobileApps: ThreatDataTableHeader[] = [{ key: 'title', value: 'TITLE', width: '30%' }, ...headersMultiple];

const headersMalware: ThreatDataTableHeader[] = [
  { key: 'title', value: 'FILENAME', width: '36%' },
  { key: 'targeted', value: 'RELEVANCE', width: '70px' },
  { key: 'avRatio', value: 'AV', width: '10%' },
  { key: 'platform', value: 'PLATFORM', width: '100px' },
  { key: 'fileSize', value: 'FILE SIZE', width: '100px' },
  { key: 'uploadDate', value: 'UPLOAD DATE', width: '100px' },
  { key: 'severity', value: 'SEVERITY', width: '100px' },
  ACTIONS_SHORT
];

export const headersAllThreats: ThreatDataTableHeader[] = [
  { key: 'title', value: 'AFFECTED ASSETS', width: '20%' },
  { key: 'moduleName', value: 'MODULE' },
  { key: 'rating', value: 'RATING', width: '120px' },
  { key: 'searchPhrase', value: 'SEARCH WORD', sort: false },
  { key: 'changedAt', value: 'UPDATED AT'},
  { key: 'relevance', value: 'RELEVANCE'},
  ACTIONS_SHORT
];

export const headersObj: Record<ModuleNameType, ThreatDataTableHeader[]> = {
  [MODULE_NAME.CREDENTIAL]: headersCredentials,
  [MODULE_NAME.SOCIAL_MEDIA]: headersSocialMedia,
  [MODULE_NAME.CREDIT_CARD]: headersCreditCard,
  [MODULE_NAME.DOMAIN_PROTECTION]: headersDomainProtection,
  [MODULE_NAME.MOBILE_APPS]: headersMobileApps,
  [MODULE_NAME.MALWARE]: headersMalware,
  [MODULE_NAME.DATA_LEAKAGE]: headersDataLeakage,
  [MODULE_NAME.HACKTIVISM]: headersHacktivism,
  [MODULE_NAME.MEDIA_TRACKER]: headersMediaTracker,
  [MODULE_NAME.DARK_WEB]: headersDarkWeb,
  [MODULE_NAME.CUSTOM]: headersCustom,
  [MODULE_NAME.THREAT_CONTEXT]: [] as ThreatDataTableHeader[],
  [MODULE_NAME.EXPLORER]: [] as ThreatDataTableHeader[]
};

export const modulesWithUrl: ModuleNameType[] = [
  MODULE_NAME.DARK_WEB,
  MODULE_NAME.MOBILE_APPS,
  MODULE_NAME.DOMAIN_PROTECTION,
  MODULE_NAME.SOCIAL_MEDIA,
  MODULE_NAME.DATA_LEAKAGE,
  MODULE_NAME.HACKTIVISM,
  MODULE_NAME.MEDIA_TRACKER,
  MODULE_NAME.CUSTOM
];
