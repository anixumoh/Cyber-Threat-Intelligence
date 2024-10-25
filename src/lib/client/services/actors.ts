import type { IQuerystringsParams } from '$lib/types/thiapp';
import Service from '.';

export interface ActorResponse {
  data: ActorData[];
  meta: { pagination: { count: number; limit: number; offset: number } };
}

interface SingleActorResponse {
  data: ActorData;
}

export interface ActorData {
  id: string;
  attributes: ActorAttributes;
  relationships: ActorRelationships;
}

interface ActorAttributes {
  aliases: string[];
  updated_at: string;
  objective: string;
  active: boolean;
  modus_operandi: string;
  last_seen: string;
  impact?: number;
  tlp: string;
  types: string[];
  sophistication: string;
  first_seen: string;
  references: { link: string; title: string }[];
  name: string;
  description: string;
  ioc_link: string;
  created_at: string;
  country_name?: string;
}

type ActorRelationships = {
  campaigns?: {
    meta?: { count: number };
  };
  tools?: {
    meta?: { count: number };
  };
  cves?: {
    meta?: { count: number };
  };
  attack_patterns?: {
    meta?: { count: number };
  };
  signatures?: {
    meta?: { count: number };
  };
  country?: {
    data?: {
      id: string;
      type: string;
    };
  };
};

export type Actor = Omit<ActorData, 'attributes'> & ActorAttributes;

export type IndicatorResponse = {
  data: IndicatorData[];
  meta: { pagination: { count: number; limit: number; offset: number } };
};

export type IndicatorData = {
  id: string;
  attributes: IndicatorAttributes;
};

export type IndicatorAttributes = {
  value: string;
  ioc_types: any[];
  slugs_tags: any[];
  type: string;
  created_at: string;
  updated_at: string;
  first_seen: string;
  last_seen: string;
  risk: number;
  tags: any[];
};

interface CampaignResponse {
  data: CampaignData[];
  meta: { pagination: { count: number; limit: number; offset: number } };
}

export interface CampaignData {
  id: string;
  attributes: CampaignAttributes;
}

interface CampaignAttributes {
  ioc_link: string;
  description: string;
  last_seen: string;
  updated_at: string;
  tlp: string;
  first_seen: string;
  created_at: string;
  name: string;
}

export type Campaign = Omit<CampaignData, 'attributes'> & CampaignAttributes;

interface ToolResponse {
  data: ToolData[];
  meta: { pagination: { count: number; limit: number; offset: number } };
}

interface ToolData {
  id: string;
  attributes: ToolAttributes;
}

interface ToolAttributes {
  first_seen: string;
  description: string;
  last_seen: string;
  version: string;
  created_at: string;
  name: string;
  tlp: string;
  targeted_platforms: string[];
  updated_at: string;
}

export interface CVEResponse {
  data: CVEData[];
  meta: { pagination: { count: number; limit: number; offset: number } };
}

export type CVEDetailsResponse = {
  data: CVEData;
};

export interface CVEData {
  id: string;
  attributes: CVEAttributes;
  relationships: CVERelationships;
}

export interface CVEAttributes {
  description: string;
  popularity: number;
  num_pocs: number;
  ioc_link: string;
  cvss: Cvss;
  updated_at: string;
  status: string;
  score: number;
  microsoft_bulletins: any[];
  name: string;
  num_malware: number;
  exploits: Exploit[];
  previous_bl_score: number;
  platforms: Platform[];
  bl_score_changed_at: string;
  bl_score: number;
  published_at: string;
  created_at: string;
  num_signatures: number;
  popularity_changed: boolean;
  references: Reference[];
}

export type CVERelationships = {
  malware: { meta: { count: number } };
  threat_actors: { meta: { count: number } };
  mentions: { meta: { count: number } };
};

export interface SignatureResponse {
  data: SignatureData[];
}

export interface SignatureData {
  id: string;
  attributes: SignatureAttributes;
}

export interface SignatureAttributes {
  tlp: string;
  version: number;
  sid: number;
  signature: string;
  updated_at: string;
  status: string;
  type: string;
  name: string;
  created_at: string;
  references: string[];
}

export interface Cvss {
  v2: V2;
  v3: V3;
}

export interface V2 {
  version: string;
  baseScore: number;
  accessVector: string;
  vectorString: string;
  authentication: string;
  integrityImpact: string;
  accessComplexity: string;
  availabilityImpact: string;
  confidentialityImpact: string;
}

export interface V3 {
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
}

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

interface CountryResponse {
  data: Country[];
  meta: { pagination: { count: number; limit: number; offset: number } };
}

type SingleCountryResponse = {
  data: Country;
};

export interface Country {
  id: string;
  attributes: CountryAttributes;
}

interface CountryAttributes {
  created_at: string;
  updated_at: string;
  name: string;
  iso_code: string;
  latitude: number;
  longitude: number;
}

export type Tool = Omit<ToolData, 'attributes'> & ToolAttributes;

export type TCXQuery = {
  'page[limit]'?: number;
  'page[offset]'?: number;
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

type TargetResponse = {
  data: TargetItem[];
};

export type TargetItem = {
  id: string;
  attributes: TargetAttributes;
  relationships: TargetRelationships;
};

type TargetAttributes = {
  created_at: string;
  description: string;
  display_name: string;
  updated_at: string;
  name: string;
  category: 'countries' | 'regions' | 'sectors' | 'organizations' | 'specifics';
};

type TargetRelationships = {
  region?: {
    data: {
      type: string;
      id: string;
      name: string;
      countries: {
        name: string;
        iso_code: string;
      }[];
    };
  };
  country?: {
    data: {
      type: string;
      id: string;
      name: string;
      iso_code: string;
    };
  };
};

export type TCX_MODEL = 'threat-actor' | 'campaign' | 'tool' | 'cve' | 'ioc' | 'attack-pattern' | 'signature';

export default class ActorsService extends Service {
  searchText: string;
  apiId = 'THIAPP';
  abort() {}

  list(params: IQuerystringsParams, resource = 'threat-actor') {
    const queryString = Object.keys(this.getQuerystring(params))
      .map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      })
      .join('&');
    const url = `/${resource}/?${queryString}`;
    return this.get({ url });
  }

  get({ url, options }: { url: string; options?: any }) {
    const { apiId } = this;

    const buildOptions = {
      apiId,
      url: this.getUrl(url),
      requestType: 'GET'
    };
    return this.client.post('/api/v2/gateway', buildOptions, options);
  }

  getQuerystring(params: IQuerystringsParams & { dork?: string; pid?: string; search?: string; category?: string }) {
    const { limit, page, searchField, searchValue, filterField, filterValue, ...rest } = params;
    let query = {};
    if (limit) {
      query['page'] = { limit };
      if (page) {
        query['page']['offset'] = page * limit;
      }
    }
    if (searchValue && searchField) {
      query['fuzzy_filter'] = { [searchField]: searchValue };
    }
    if (filterField && filterValue) {
      query['filter'] = { [filterField]: filterValue };
    }

    if (!rest.dork) {
      delete rest.dork;
    }

    query = { ...query, ...rest };
    const urlParams = {};

    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === 'object') {
        const name = key;
        Object.entries(value).forEach(([key, value]) => {
          urlParams[`${name}[${key}]`] = value;
        });
      } else if (typeof value === 'string') {
        urlParams[key] = value;
      }
    });
    return urlParams;
  }

  private getUrl(url, api = '/api/v1') {
    return /^http/.test(url) ? url : `${api}${url}`;
  }

  // TCX
  async getActors(limit = 100, sort = '-last_seen', extraParams: Record<string, string> = {}): Promise<Actor[]> {
    const params = {
      'page[limit]': String(limit),
      sort,
      ...extraParams
    };

    const searchParams = new URLSearchParams(params);
    const url = `/api/v1/threat-actor/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<ActorResponse>('/api/v2/gateway', buildOptions);
    const actors: Actor[] = response.data.data.map((row) => ({
      id: row.id,
      ...row.attributes,
      relationships: row.relationships
    }));
    return actors;
  }

  async getActor(actorId: number) {
    const url = `/api/v1/threat-actor/${actorId}/`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<SingleActorResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getActorIndicators(actorId: number | string) {
    const params = {
      'page[limit]': '100'
    };
    const searchParams = new URLSearchParams(params);

    const url = `/api/v1/threat-actor/${actorId}/ioc/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<IndicatorResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getActorCampaigns(actorId: number | string) {
    const params = {
      'page[limit]': '100'
    };
    const searchParams = new URLSearchParams(params);

    const url = `/api/v1/threat-actor/${actorId}/campaign/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<CampaignResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getActorTools(actorId: number | string) {
    const params = {
      'page[limit]': '100'
    };
    const searchParams = new URLSearchParams(params);

    const url = `/api/v1/threat-actor/${actorId}/tool/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<ToolResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getActorCVE(actorId: number | string) {
    const params = {
      'page[limit]': '100'
    };
    const searchParams = new URLSearchParams(params);

    const url = `/api/v1/threat-actor/${actorId}/cve/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<CVEResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getActorSignature(actorId: number | string) {
    const params = {
      'page[limit]': '100'
    };
    const searchParams = new URLSearchParams(params);

    const url = `/api/v1/threat-actor/${actorId}/signature/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<SignatureResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getActorTarget(actorId: number | string) {
    const params = {
      'page[limit]': '100'
    };
    const searchParams = new URLSearchParams(params);

    const url = `/api/v1/threat-actor/${actorId}/target/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<TargetResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getCampaigns(campaignQuery: TCXQuery): Promise<Campaign[]> {
    const defaultQuery: TCXQuery = {
      'page[limit]': 100,
      sort: '-last_seen'
    };
    const query = { ...defaultQuery, ...campaignQuery };

    const searchParams = new URLSearchParams(query);
    const url = `/api/v1/campaign/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<CampaignResponse>('/api/v2/gateway', buildOptions);
    const campaigns = response.data.data.map((row) => ({
      id: row.id,
      ...row.attributes
    }));
    return campaigns;
  }

  async getTools(toolQuery: TCXQuery): Promise<Tool[]> {
    const defaultQuery: TCXQuery = {
      'page[limit]': 100,
      sort: '-last_seen'
    };
    const query = { ...defaultQuery, ...toolQuery };

    const searchParams = new URLSearchParams(query);
    const url = `/api/v1/tool/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<ToolResponse>('/api/v2/gateway', buildOptions);
    const tools = response.data.data.map((row) => ({
      id: row.id,
      ...row.attributes
    }));
    return tools;
  }

  async getCveDetails(cve: string) {
    const url = `/api/v1/cve/${cve}/`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };
    const response = await this.client.post<CVEDetailsResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getRelationships(id: string | number, type: TCX_MODEL, relationship: TCX_MODEL) {
    const url = `/api/v1/${type}/${id}/relationships/${relationship}/`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };
    const response = await this.client.post<{ data: { id: number; name: string }[] | { id: number } }>(
      '/api/v2/gateway',
      buildOptions
    );
    return response.data.data;
  }

  async getRelatedItems(id: string | number, modelSource: TCX_MODEL, modelTarget: TCX_MODEL, cveQuery: TCXQuery) {
    const defaultQuery = {
      'page[limit]': '10'
    };
    const query = { ...defaultQuery, ...cveQuery };
    const searchParams = new URLSearchParams(query);

    const url = `/api/v1/${modelSource}/${id}/${modelTarget}/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };
    const response = await this.client.post<
      ActorResponse | CampaignResponse | ToolResponse | CVEResponse | IndicatorResponse
    >('/api/v2/gateway', buildOptions);
    return response.data;
  }

  async getItemName(id: string | number, type: TCX_MODEL): Promise<string> {
    const url = `/api/v1/${type}/${id}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };
    const response = await this.client.post('/api/v2/gateway', buildOptions);
    return response.data?.data?.attributes?.name ?? 'unknown';
  }

  async getCountry(countryId: string) {
    const url = `/api/v1/country/${countryId}/`;

    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };
    const response = await this.client.post<SingleCountryResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getCountries(offset = 0) {
    const defaultQuery: TCXQuery = {
      'page[limit]': 100,
      'page[offset]': offset
    };
    const query = { ...defaultQuery };

    const searchParams = new URLSearchParams(query as Record<string, string>);
    const url = `/api/v1/country/?${searchParams}`;

    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };
    const response = await this.client.post<CountryResponse>('/api/v2/gateway', buildOptions);
    return response.data;
  }

  async getAllCountries(): Promise<Country[]> {
    const response = await this.getCountries();

    const countries = response.data;

    const pages = Math.ceil(response.meta.pagination.count / 100);

    const pagesToRequest = [];
    for (let i = 1; i < pages; i++) {
      pagesToRequest.push(i);
    }

    const promises = pagesToRequest.map((page) => this.getCountries(page * 100));
    const responses = await Promise.all(promises);
    responses.forEach((response) => countries.concat(response.data));

    return countries;
  }
}
