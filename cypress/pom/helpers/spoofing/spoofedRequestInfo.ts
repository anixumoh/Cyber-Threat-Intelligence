import { CypressTests } from './cypressTests.ts';
import { ENDPOINTS } from './endpoints.ts';

export type SpoofedRequestInfo = {
  endpoint: ENDPOINTS;
  alias: string;
  url: string;
  method: string;
  fixture?: string;
  statusCode?: number;
  cypressTests?: Array<CypressTests>;
};
