import Service from '.';

export type ApiKey = {
  userId: number;
  apiKey: string;
  enabled: boolean;
  expirationDate: number;
  creationDate: number;
};

export default class KeysService extends Service {
  async getApiKey(userId: number) {
    const url = `/api/v2/keys/${userId}`;
    const response = await this.client.get(url);
    return response.data;
  }

  async createApiKey() {
    const url = '/api/v2/keys';
    const response = await this.client.post<ApiKey>(url, {});
    return response.data;
  }

  async modifyApiKey(userId: number, payload: Partial<ApiKey>) {
    const url = `/api/v2/keys/${userId}`;
    const response = await this.client.put<ApiKey>(url, payload);
    return response.data;
  }

  async disableApiKey(userId: number) {
    const url = `/api/v2/keys/${userId}/disable`;
    const response = await this.client.put(url);
    return response.data;
  }

  async enableApiKey(userId: number) {
    const url = `/api/v2/keys/${userId}/enable`;
    const response = await this.client.put(url);
    return response.data;
  }

  async revokeApiKey(userId: number) {
    const url = `/api/v2/keys/${userId}`;
    const response = await this.client.delete(url);
    return response.data;
  }
}
