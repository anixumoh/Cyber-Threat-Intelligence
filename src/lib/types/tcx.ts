import type { MENTIONS_CATEGORIES_TYPE } from '$lib/constants/tcx';

export type TCXOptionsResponse = {
  data: TCXOptions;
};

export type TCXOptions = {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  allowed_methods: string[];
  dork_fields: Record<string, { type: string; description: string }>;
};

export type TCXQuery = {
  'page[limit]'?: number;
  'page[offset]'?: number;
  'filter[feed_source_category]'?: MENTIONS_CATEGORIES_TYPE;
  sort?:
    | 'name'
    | '-name'
    | 'first_seen'
    | '-first_seen'
    | 'last_seen'
    | '-last_seen'
    | 'bl_score'
    | '-bl_score'
    | 'score'
    | '-score'
    | 'published_at,bl_score'
    | '-published_at,bl_score';
  dork?: string;
};

export enum TCXModel {
  THREAT_ACTOR = 'threat-actor',
  CAMPAIGN = 'campaign',
  TOOL = 'tool',
  CVE = 'cve',
  IOC = 'ioc',
  ATTACK_PATTERN = 'attack-pattern',
  SIGNATURE = 'signature',
  MENTION = 'mention'
}

// Single responses
export type TCXCVESingleResponse = TCXSingleModelResponse<CVEAttributes>;
export type TCXCVEMentionSingleResponse = TCXSingleModelResponse<CVEMentionAttributes>;

// List responses
export type TCXCVEResponse = TCXModelResponse<CVEAttributes>;
export type TCXCVEMentionResponse = TCXModelResponse<CVEMentionAttributes>;

// Generic response build
export type TCXModelAttributes = CVEAttributes | CVEMentionAttributes;

export type TCXSingleModelResponse<T extends TCXModelAttributes> = {
  data: TCXModelData<T>;
};

export type TCXModelResponse<T extends TCXModelAttributes> = {
  data: TCXModelData<T>[];
  meta: { pagination: { count: number; limit: number; offset: number } };
};

export type TCXModelData<T extends TCXModelAttributes> = {
  id: string;
  type: string;
  links: any;
  attributes: T;
  relationships: TCXModelRelationships;
};

export type TCXModelRelationships = {
  campaigns?: { meta: { count: number } };
  tools?: { meta: { count: number } };
  threat_actors?: { meta: { count: number } };
  mentions?: { meta: { count: number } };
  signatures?: { meta: { count: number } };
  malware?: { meta: { count: number } };
  sparks?: { meta: { count: number } };
  attack_patterns?: { meta: { count: number } };
  crime_servers?: { meta: { count: number } };
  tags?: { meta: { count: number } };
  milestones?: { meta: { count: number } };
  threat_types?: { meta: { count: number } };
  online_services?: { meta: { count: number } };
  targets?: { meta: { count: number } };
  activities?: { meta: { count: number } };
  motivations?: { meta: { count: number } };
  roles?: { meta: { count: number } };
  fqdns?: { meta: { count: number } };
  ips?: { meta: { count: number } };
  cves?: { meta: { count: number } };

  country?: {
    data?: {
      id: string;
      type: string;
    };
  };
};

// CVE Attributes

export type CVEAttributes = {
  description: string;
  cvss: Cvss;
  num_signatures: number;
  name: string;
  references: Reference[];
  microsoft_bulletins: MicrosoftBulletin[];
  score: number;
  num_pocs: number;
  ioc_link: string;
  platforms: Platform[];
  popularity: number;
  updated_at: string;
  bl_score_changed_at: string;
  published_at: string;
  tags_slugs: any[];
  previous_bl_score: number;
  num_malware: number;
  created_at: string;
  exploits: Exploit[];
  bl_score: number;
  popularity_changed: boolean;
  status: string;
};

type MicrosoftBulletin = {
  bulletin_id?: string;
  date?: string;
  impact?: string;
  knowledgebase_id?: string;
  severity?: string;
  title?: string;
  bulletin_SOURCE_FILE?: string;
  cves_url?: string;
  knowledgebase_SOURCE_FILE?: string;
  name?: string;
  publishedDate?: string;
};

type Cvss = {
  v2: V2;
  v3: V3;
};

type V2 = {
  version: string;
  baseScore: number;
  accessVector: string;
  vectorString: string;
  authentication: string;
  integrityImpact: string;
  accessComplexity: string;
  availabilityImpact: string;
  confidentialityImpact: string;
};

type V3 = {
  scope: string;
  version: string;
  baseScore: number;
  attackVector: string;
  baseSeverity: string;
  vectorString: string;
  integrityImpact: string;
  userInteraction: string;
  attackComplexity: string;
  availabilityImpact: string;
  privilegesRequired: string;
  confidentialityImpact: string;
};

export interface Exploit {
  url: string;
  date: string;
  name: string;
  port: string;
  type: string;
  author: string;
  platform: string;
}

export interface Platform {
  id: string;
  title?: string;
  vulnerable?: boolean;
}

export interface Reference {
  id?: string;
  url: string;
  type?: string;
}

// CVE Mentions
export interface CVEMentionAttributes {
  published_at: string;
  title: string;
  feed_source_category: string;
  labels: string[];
  risk_score: number;
  URL: string;
}
