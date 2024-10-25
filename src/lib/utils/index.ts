import { type ModuleNameType, MODULE_NAME } from '$lib/constants/modules';
import type Module from '$lib/types/module';

const moduleDictionary = {
  credentials: MODULE_NAME.CREDENTIAL,
  social_media: MODULE_NAME.SOCIAL_MEDIA,
  credit_cards_25: MODULE_NAME.CREDIT_CARD,
  credit_cards_50: MODULE_NAME.CREDIT_CARD,
  credit_cards_150: MODULE_NAME.CREDIT_CARD,
  credit_cards_full: MODULE_NAME.CREDIT_CARD,
  domain_protection: MODULE_NAME.DOMAIN_PROTECTION,
  mobile_apps: MODULE_NAME.MOBILE_APPS,
  malware: MODULE_NAME.MALWARE,
  data_leakage: MODULE_NAME.DATA_LEAKAGE,
  hacktivism: MODULE_NAME.HACKTIVISM,
  media_tracker: MODULE_NAME.MEDIA_TRACKER,
  dark_web: MODULE_NAME.DARK_WEB,
  custom: MODULE_NAME.CUSTOM,
  threat_context: MODULE_NAME.THREAT_CONTEXT,
  explorer: MODULE_NAME.EXPLORER
};

export function getModuleTypeName(mod: Module | any): ModuleNameType {
  return moduleDictionary[mod?.type ? mod?.type.toLowerCase() : mod.toLowerCase()];
}

export const activeClasses =
  'hover:bg-ctip-primaryHover bg-ctip-primary border-[1px] border-solid border-ctip-btnBorderActive text-white';

export const iconClasses = 'block lg:hidden';
export const iconTextClasses = 'block sm:hidden lg:block md:ml-1';
