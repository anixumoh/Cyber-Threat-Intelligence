import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'environments/environment';
export class ModuleType {
  key: string;

  constructor(
    public type: string,
    public image: string,
    public name: string,
    public description: string,
    public prefix: string
  ) {}
}

const typeDictionary = {
  credentials: 'credential',
  social_media: 'social_media',
  credit_cards_25: 'credit_card',
  credit_cards_50: 'credit_card',
  credit_cards_150: 'credit_card',
  credit_cards_full: 'credit_card',
  domain_protection: 'domain_protection',
  mobile_apps: 'mobile_apps',
  malware: 'malware',
  data_leakage: 'data_leakage',
  hacktivism: 'hacktivism',
  media_tracker: 'media_tracker',
  dark_web: 'dark_web',
  custom: 'custom',
  threat_context: 'threat_context',
  explorer: 'explorer'
};

const typeIdDictionary = {
  0: 'Any',
  1: 'Custom',
  2: 'Domain Protection',
  3: 'Credit Card',
  4: 'Credit Card',
  5: 'Credit Card',
  6: 'Credit Card',
  7: 'Mobile Apps',
  9: 'Malware',
  10: 'Credentials',
  11: 'Data Leakage',
  14: 'Social Media',
  20: 'Hacktivism',
  25: 'Media tracker',
  26: 'Dark Web',
  28: 'Threat Context',
  29: 'Explorer'
};

const modulesTypes = {
  credentials: new ModuleType(
    'credential',
    'assets/icons/sidebar/botnets.svg',
    'Credentials',
    'Module that reports information about the botnets that affect an organization and the information collected inside the botnets: credentials, IPs, data of people, credit cards, etc.',
    'CRED-'
  ),
  social_media: new ModuleType(
    'social_media',
    'assets/icons/sidebar/brand-abuse.svg',
    'Social Media',
    'Module that verifies the abuse of marks in the Web 2.0, as well as in blogs, pages Web, etc., or in ads commercial like adwords. This module also controls the opinions of users and trends according to a brand, an organization, a product, etc.',
    'SOM-'
  ),
  credit_card_25: new ModuleType(
    'credit_card',
    'assets/icons/sidebar/card-broken.svg',
    'Credit Cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  ),
  domain_protection: new ModuleType(
    'domain_protection',
    'assets/icons/sidebar/phishing.svg',
    'Domain Protection',
    'Module that captures Phishings that can affect an entity from trap mailboxes and online repositories.',
    'DOP-'
  ),
  malware: new ModuleType(
    'malware',
    'assets/icons/sidebar/bug.svg',
    'Malware',
    'Module that informs of samples of malware collected by Blueliv (repositories, honeypots, mailboxes, etc.) that can affect an entity.',
    'MLW-'
  ),
  data_leakage: new ModuleType(
    'data_leakage',
    'assets/icons/sidebar/dataleakage.svg',
    'Data Leakage',
    'Module that searches in repositories of files, documental repositories and networks P2P: documents, images, sheets xcel, etc., that are confidential or should not be published.',
    'DLD-'
  ),
  hacktivism: new ModuleType(
    'hacktivism',
    'assets/icons/sidebar/hacktivism.svg',
    'Hacktivism',
    'Module that contains information about possible hacktivist groups that intend to attack the technological assets of the Organization (IPs, domains, technology platforms, websites, etc.), as well as against companies in the sector. On the other hand, this module collects potential 0-days that may affect such assets or the technology and platforms used.',
    'HAP-'
  ),
  dark_web: new ModuleType(
    'dark_web',
    'assets/icons/sidebar/dark-web.svg',
    'Dark Web',
    'Module you are looking for in the dark web',
    'DAW-'
  ),
  custom: new ModuleType('custom', 'assets/icons/sidebar/custom.svg', 'Custom', 'Create a customized module', 'CUS-'),
  media_tracker: new ModuleType(
    'media_tracker',
    'assets/icons/sidebar/media-tracker.svg',
    'Media tracker',
    'Module that search news in newspapers around the world',
    'NWS-'
  ),
  mobile_apps: new ModuleType(
    'mobile_apps',
    'assets/icons/sidebar/mobile.svg',
    'Mobile Apps',
    'Module for Mobile Apps',
    'MAM-'
  ),
  threat_context: new ModuleType(
    'threat_context',
    'assets/icons/sidebar/intelligence.svg',
    'Threat Context',
    'Module for Threat Context',
    'THC-'
  ),
  explorer: new ModuleType(
    'explorer',
    'assets/icons/sidebar/radar.svg',
    'Explorer',
    'The explorer module delivers intelligence about vulnerabilities and malware related with the customer technologies and assests. Based on the global information included in Threat Context, this module provides customer specific intelligence that helps to determine how exposed is your organization, adding basic contextual information for a better decision making.',
    'EXP-'
  )
};

const cardingTypes = {
  credit_cards_full: new ModuleType(
    'credit_card',
    'credit_card',
    'Credit cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  ),
  credit_cards_25: new ModuleType(
    'credit_card',
    'credit_card',
    'Credit cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  ),
  credit_cards_50: new ModuleType(
    'credit_card',
    'credit_card',
    'Credit cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  ),
  credit_cards_150: new ModuleType(
    'credit_card',
    'credit_card',
    'Credit cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  )
};

const cardingSubject = new BehaviorSubject(cardingTypes);
const moduleSubject = new BehaviorSubject(modulesTypes);
const typesIdSubject = new BehaviorSubject(typeIdDictionary);

export function getTypeDictionary() {
  return typeDictionary;
}

export function getModulesTypePlain() {
  if (!environment.production) {
    // console.trace("Carefully, it should be using the observable method")
  }
  return modulesTypes;
}

export function getModulesType(): Observable<any> {
  return moduleSubject;
}

export function getCardingSubmmodulesType() {
  return cardingSubject;
}

export function getTypesId(): Observable<any> {
  return typesIdSubject;
}
