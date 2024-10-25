import type { ModuleNameType } from '$lib/constants/modules';

export default interface Module {
  id: number;
  name: string;
  moduleName: ModuleNameType;
  shortName: string;
  enabled: boolean;
  type: string;
  demoMode: boolean;
  createdAt: number;
  moduleStrictTokens: string[];
  firstDataLoad?: boolean;
  plugins?: string[];
  hideCC?: boolean;
  hidePasswords?: boolean;
}

export type ModuleType = {
  type: ModuleNameType;
  key: string;
  image: string;
  name: string;
  description: string;
  prefix: string;
};

export type ModuleModelType = {
  id?: number;
  name: string;
  shortName: string;
  organizationId: number;
  enabled: boolean;
  type: string;
  demoMode?: boolean;
  moduleName?: string;
  plugins?: string[];
  firstDataLoad?: boolean;
  moduleStrictTokens?: string[];
};

export const modulesTypes: ModuleType[] = [
  {
    type: 'credential',
    key: 'credentials',
    image: 'assets/icons/sidebar/botnets.svg',
    name: 'Credentials',
    description:
      'Module that reports information about the botnets that affect an organization and the information collected inside the botnets: credentials, IPs, data of people, credit cards, etc.',
    prefix: 'CRED-'
  },
  {
    type: 'social_media',
    key: 'social_media',
    image: 'assets/icons/sidebar/brand-abuse.svg',
    name: 'Social Media',
    description:
      'Module that verifies the abuse of marks in the Web 2.0, as well as in blogs, pages Web, etc., or in ads commercial like adwords. This module also controls the opinions of users and trends according to a brand, an organization, a product, etc.',
    prefix: 'SOM-'
  },
  {
    type: 'credit_card',
    key: 'credit_cards_full',
    image: 'assets/icons/sidebar/card-broken.svg',
    name: 'Credit Cards',
    description: 'Module that shows credit cards and associated data (exp, cvv2, card holder, etc.).',
    prefix: 'CC-'
  },
  {
    type: 'domain_protection',
    key: 'domain_protection',
    image: 'assets/icons/sidebar/phishing.svg',
    name: 'Domain Protection',
    description:
      'Module that captures Phishings that can affect an entity from trap mailboxes and online repositories.',
    prefix: 'DOP-'
  },
  {
    type: 'malware',
    key: 'malware',
    image: 'assets/icons/sidebar/bug.svg',
    name: 'Malware',
    description:
      'Module that informs of samples of malware collected by Blueliv (repositories, honeypots, mailboxes, etc.) that can affect an entity.',
    prefix: 'MLW-'
  },
  {
    type: 'data_leakage',
    key: 'data_leakage',
    image: 'assets/icons/sidebar/dataleakage.svg',
    name: 'Data Leakage',
    description:
      'Module that searches in repositories of files, documental repositories and networks P2P: documents, images, sheets xcel, etc., that are confidential or should not be published.',
    prefix: 'DLD-'
  },
  {
    type: 'hacktivism',
    key: 'hacktivism',
    image: 'assets/icons/sidebar/hacktivism.svg',
    name: 'Hacktivism',
    description:
      'Module that contains information about possible hacktivist groups that intend to attack the technological assets of the Organization (IPs, domains, technology platforms, websites, etc.), as well as against companies in the sector. On the other hand, this module collects potential 0-days that may affect such assets or the technology and platforms used.',
    prefix: 'HAP-'
  },
  {
    type: 'dark_web',
    key: 'dark_web',
    image: 'assets/icons/sidebar/dark-web.svg',
    name: 'Dark Web',
    description: 'Module you are looking for in the dark web',
    prefix: 'DAW-'
  },
  {
    type: 'custom',
    key: 'custom',
    image: 'assets/icons/sidebar/custom.svg',
    name: 'Custom',
    description: 'Create a customized module',
    prefix: 'CUS-'
  },
  {
    type: 'media_tracker',
    key: 'media_tracker',
    image: 'assets/icons/sidebar/media-tracker.svg',
    name: 'Media tracker',
    description: 'Module that search news in newspapers around the world',
    prefix: 'NWS-'
  },
  {
    type: 'mobile_apps',
    key: 'mobile_apps',
    image: 'assets/icons/sidebar/mobile.svg',
    name: 'Mobile Apps',
    description: 'Module for Mobile Apps',
    prefix: 'MAM-'
  },
  {
    type: 'threat_context',
    key: 'threat_context',
    image: 'assets/icons/sidebar/intelligence.svg',
    name: 'Threat Context',
    description: 'Module for Threat Context',
    prefix: 'THC-'
  },
  {
    type: 'explorer',
    key: 'explorer',
    image: 'assets/icons/sidebar/radar.svg',
    name: 'Explorer',
    description:
      'The explorer module delivers intelligence about vulnerabilities and malware related with the customer technologies and assests. Based on the global information included in Threat Context, this module provides customer specific intelligence that helps to determine how exposed is your organization, adding basic contextual information for a better decision making.',
    prefix: 'EXP-'
  }
];
