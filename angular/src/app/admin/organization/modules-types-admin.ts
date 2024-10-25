import { BehaviorSubject } from 'rxjs';
import { environment } from 'environments/environment';

export class ModuleTypeAdmin {
  public key: string;

  constructor(
    public type: string,
    public image: string,
    public name: string,
    public description: string,
    public prefix: string
  ) {}
}

let typeDictionary: any = {
  credentials: 'credentials',
  social_media: 'social_media',
  credit_cards_25: 'credit_cards',
  credit_cards_50: 'credit_cards',
  credit_cards_150: 'credit_cards',
  credit_cards_full: 'credit_cards',
  domain_protection: 'domain_protection',
  mobile_apps: 'mobile_apps',
  malware: 'malware',
  data_leakage: 'data_leakage',
  hacktivism: 'hacktivism',
  media_tracker: 'media_tracker',
  dark_web: 'dark_web',
  custom: 'custom',
  threat_context: 'threat_context'
};

let modulesTypes = {
  credentials: new ModuleTypeAdmin(
    'credentials',
    'assets/icons/sidebar/botnets.svg',
    'Credentials',
    'Module that reports information about the botnets that affect an organization and the information collected inside the botnets: credentials, IPs, data of people, credit cards, etc.',
    'CRED-'
  ),
  social_media: new ModuleTypeAdmin(
    'social_media',
    'assets/icons/sidebar/brand-abuse.svg',
    'Social Media',
    'Module that verifies the abuse of marks in the Web 2.0, as well as in blogs, pages Web, etc., or in ads commercial like adwords. This module also controls the opinions of users and trends according to a brand, an organization, a product, etc.',
    'SOM-'
  ),
  credit_card_25: new ModuleTypeAdmin(
    'credit_cards',
    'assets/icons/sidebar/card-broken.svg',
    'Credit Cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  ),
  domain_protection: new ModuleTypeAdmin(
    'domain_protection',
    'assets/icons/sidebar/phishing.svg',
    'Domain Protection',
    'Module that captures Phishings that can affect an entity from trap mailboxes and online repositories.',
    'DOP-'
  ),
  malware: new ModuleTypeAdmin(
    'malware',
    'assets/icons/sidebar/bug.svg',
    'Malware',
    'Module that informs of samples of malware collected by Blueliv (repositories, honeypots, mailboxes, etc.) that can affect an entity.',
    'MLW-'
  ),
  data_leakage: new ModuleTypeAdmin(
    'data_leakage',
    'assets/icons/sidebar/dataleakage.svg',
    'Data Leakage',
    'Module that searches in repositories of files, documental repositories and networks P2P: documents, images, sheets xcel, etc., that are confidential or should not be published.',
    'DLD-'
  ),
  hacktivism: new ModuleTypeAdmin(
    'hacktivism',
    'assets/icons/sidebar/hacktivism.svg',
    'Hacktivism',
    'Module that contains information about possible hacktivist groups that intend to attack the technological assets of the Organization (IPs, domains, technology platforms, websites, etc.), as well as against companies in the sector. On the other hand, this module collects potential 0-days that may affect such assets or the technology and platforms used.',
    'HAP-'
  ),
  dark_web: new ModuleTypeAdmin(
    'dark_web',
    'assets/icons/sidebar/dark-web.svg',
    'Dark Web',
    'Module you are looking for in the dark web',
    'DAW-'
  ),
  custom: new ModuleTypeAdmin(
    'custom',
    'assets/icons/sidebar/custom.svg',
    'Custom',
    'Create a customized module',
    'CUS-'
  ),
  media_tracker: new ModuleTypeAdmin(
    'media_tracker',
    'assets/icons/sidebar/media-tracker.svg',
    'Media tracker',
    'Module that search news in newspapers around the world',
    'NWS-'
  ),
  mobile_apps: new ModuleTypeAdmin(
    'mobile_apps',
    'assets/icons/sidebar/mobile.svg',
    'Mobile Apps',
    'Module for Mobile Apps',
    'MAM-'
  ),
  threat_context: new ModuleTypeAdmin(
    'threat_context',
    'assets/icons/sidebar/intelligence.svg',
    'Threat Context',
    'Module for Threat Context',
    'THC-'
  ),
  explorer: new ModuleTypeAdmin(
    'explorer',
    'assets/icons/sidebar/radar.svg',
    'Explorer',
    'The explorer module delivers intelligence about vulnerabilities and malware related with the customer technologies and assests.',
    'EXP-'
  )
};

let cardingTypes = {
  credit_cards_full: new ModuleTypeAdmin(
    'credit_cards',
    modulesTypes.credit_card_25.image,
    'Credit cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  ),
  credit_cards_25: new ModuleTypeAdmin(
    'credit_cards',
    modulesTypes.credit_card_25.image,
    'Credit cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  ),
  credit_cards_50: new ModuleTypeAdmin(
    'credit_cards',
    modulesTypes.credit_card_25.image,
    'Credit cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  ),
  credit_cards_150: new ModuleTypeAdmin(
    'credit_cards',
    modulesTypes.credit_card_25.image,
    'Credit cards',
    'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    'CC-'
  )
};

let cardingSubject = new BehaviorSubject(cardingTypes);
let moduleSubject = new BehaviorSubject(modulesTypes);

export function getTypeDictionaryAdmin() {
  return typeDictionary;
}

export function getModulesTypePlainAdmin() {
  if (!environment.production) {
    // console.trace("Carefully, it should be using the observable method")
  }
  return modulesTypes;
}

export function getModulesTypeAdmin() {
  return moduleSubject;
}

export function getCardingSubmmodulesTypeAdmin() {
  return cardingSubject;
}
