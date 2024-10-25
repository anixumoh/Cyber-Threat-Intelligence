export const MENTIONS_CATEGORIES_KEYS = [
  'BLUELIV_COMMUNITY',
  'CLEARNET_FORUM',
  'CODE_REPOSITORY',
  'DARKWEB',
  'DOC_REPOSITORY',
  'HACKTIVISM',
  'INTERNET_SCANNERS',
  'NEWS',
  'OTHERS',
  'PASTES',
  'SEARCH_ENGINE',
  'SECURITY_NEWS',
  'SECURITY_VENDORS',
  'SOCIAL',
  'WEBSITES'
] as const;

export type MENTIONS_CATEGORIES_TYPE = keyof typeof MENTIONS_CATEGORIES_KEYS;
