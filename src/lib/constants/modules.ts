export const MODULE_NAME = {
  CREDENTIAL: 'credential',
  CREDENTIALS: 'credentials',
  MALWARE: 'malware',
  CREDIT_CARD: 'credit_card',
  CREDIT_CARDS_FULL: 'credit_card',
  DARK_WEB: 'dark_web',
  CUSTOM: 'custom',
  MOBILE_APPS: 'mobile_apps',
  DOMAIN_PROTECTION: 'domain_protection',
  SOCIAL_MEDIA: 'social_media',
  DATA_LEAKAGE: 'data_leakage',
  HACKTIVISM: 'hacktivism',
  MEDIA_TRACKER: 'media_tracker',
  THREAT_CONTEXT: 'threat_context',
  EXPLORER: 'explorer'
} as const;

export type ModuleNameType = (typeof MODULE_NAME)[keyof typeof MODULE_NAME];
