import { MENTIONS_CATEGORIES_KEYS } from '$lib/constants/tcx';
import type {
  TCXCVEMentionResponse,
  TCXCVEResponse,
  TCXCVESingleResponse,
  TCXModel,
  TCXModelAttributes,
  TCXModelResponse,
  TCXOptionsResponse,
  TCXQuery
} from '$lib/types/tcx';
import Service from '.';

export default class TCXService extends Service {
  searchText: string;
  apiId = 'THIAPP';

  abort() {}

  async getOptions(model: TCXModel) {
    const buildOptions = {
      apiId: 'THIAPP',
      url: `/api/v1/${model}/`,
      requestType: 'OPTIONS'
    };
    const response = await this.client.post<TCXOptionsResponse>('/api/v2/gateway', buildOptions);
    return response.data.data;
  }

  async getRelatedItems(id: string | number, modelSource: TCXModel, modelTarget: TCXModel, cveQuery: TCXQuery) {
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
    const response = await this.client.post<TCXModelResponse<TCXModelAttributes>>('/api/v2/gateway', buildOptions);
    return response.data;
  }

  async getCVEs(cveQuery: TCXQuery) {
    const defaultQuery = {
      'page[limit]': '100'
    };
    const query = { ...defaultQuery, ...cveQuery };
    const searchParams = new URLSearchParams(query);

    const url = `/api/v1/cve/?${searchParams}`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };

    const response = await this.client.post<TCXCVEResponse>('/api/v2/gateway', buildOptions);
    return response.data;
  }

  async getCVE(cve: string) {
    const url = `/api/v1/cve/${cve}/`;
    const buildOptions = {
      apiId: 'THIAPP',
      url,
      requestType: 'GET'
    };
    const response = await this.client.post<TCXCVESingleResponse>('/api/v2/gateway', buildOptions);
    return response.data;
  }

  async getCVEMentions(cve: string) {
    const mentions: TCXCVEMentionResponse[] = [];

    const promises = MENTIONS_CATEGORIES_KEYS.map(async (mention) => {
      const query = {
        // 'page[limit]': '1'
        'filter[feed_source_category]': mention
      };
      const searchParams = new URLSearchParams(query);
      const url = `/api/v1/cve/${cve}/mention/?${searchParams}`;
      const buildOptions = {
        apiId: 'THIAPP',
        url,
        requestType: 'GET'
      };
      const response = await this.client.post<TCXCVEMentionResponse>('/api/v2/gateway', buildOptions);
      mentions.push(response.data);
    });

    await Promise.allSettled(promises);
    return mentions;
  }
}
