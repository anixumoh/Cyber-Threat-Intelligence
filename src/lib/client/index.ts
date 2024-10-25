import { handle429Response } from '$lib/utils/functions';
import logout from '$lib/utils/logout';
import token from '$stores/token';
import axios, { type Axios, type CancelTokenSource } from 'axios';
import { get } from 'svelte/store';
import ActorsService from './services/actors';
import AdminService from './services/admin';
import AssetsService from './services/assets';
import CommentsService from './services/comments';
import FeedsService from './services/feeds';
import FilesService from './services/files';
import GatewayService from './services/gateway';
import IncidentsService from './services/incidents';
import KeysService from './services/keys';
import MalwareService from './services/malware';
import ModulesService from './services/modules';
import OrganizationService from './services/organization';
import SettingsService from './services/settings';
import TCXService from './services/tcx';
import ThreatsService from './services/threats';
import UserService from './services/user';

export default class Client {
  protected client: Axios;
  protected noLogoutClient: Axios;
  protected cancelToken: CancelTokenSource;

  user: UserService;
  modules: ModulesService;
  settings: SettingsService;
  threats: ThreatsService;
  files: FilesService;
  incidents: IncidentsService;
  actors: ActorsService;
  tcx: TCXService;
  comments: CommentsService;
  malware: MalwareService;
  gateway: GatewayService;
  organization: OrganizationService;
  feedsService: FeedsService;
  assets: AssetsService;
  admin: AdminService;
  keys: KeysService;

  constructor() {
    this.cancelToken = axios.CancelToken.source();
    this.client = axios.create({
      cancelToken: this.cancelToken.token
    });
    this.client.interceptors.request.use(
      async (config) => {
        config.params = { ...config.params, notcache: new Date().getTime() };
        const tokenValue = get(token);
        if (tokenValue) {
          config.headers['x-cookie'] = get(token);
        }
        config.withCredentials = true;
        config.headers.uirequest = true;
        config.headers['Content-Type'] ??= 'application/json';
        await Promise.resolve();
        return config;
      },
      (error) => Promise.reject(error)
    );
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (axios.isAxiosError(error)) {
          if (error.response.status === 401) {
            await logout();
            throw new axios.Cancel();
          }
          handle429Response(error.response);
          return Promise.reject(error);
        }
      }
    );

    this.noLogoutClient = axios.create();
    this.noLogoutClient.interceptors.request.use(
      async (config) => {
        config.params = { ...config.params, notcache: new Date().getTime() };
        const tokenValue = get(token);
        if (tokenValue) {
          config.headers['x-cookie'] = get(token);
        }
        config.withCredentials = true;
        config.headers.uirequest = true;
        config.headers['Content-Type'] ??= 'application/json';
        await Promise.resolve();
        return config;
      },
      (error) => Promise.reject(error)
    );
    this.noLogoutClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (axios.isAxiosError(error)) {
          handle429Response(error.response);
          return Promise.reject(error);
        }
      }
    );

    this.user = new UserService(this.client);
    this.modules = new ModulesService(this.client);
    this.settings = new SettingsService(this.client);
    this.threats = new ThreatsService(this.client);
    this.files = new FilesService(this.client);
    this.incidents = new IncidentsService(this.client);
    this.actors = new ActorsService(this.noLogoutClient);
    this.tcx = new TCXService(this.noLogoutClient);
    this.comments = new CommentsService(this.client);
    this.malware = new MalwareService(this.client);
    this.gateway = new GatewayService(this.noLogoutClient);
    this.organization = new OrganizationService(this.client);
    this.feedsService = new FeedsService(this.client);
    this.assets = new AssetsService(this.client);
    this.admin = new AdminService(this.client);
    this.keys = new KeysService(this.client);
  }

  abort() {
    this.cancelToken.cancel();
    this.user.abort();
    this.modules.abort();
    this.settings.abort();
    this.threats.abort();
    this.files.abort();
    this.incidents.abort();
    this.actors.abort();
    this.tcx.abort();
    this.comments.abort();
    this.malware.abort();
    this.gateway.abort();
    this.organization.abort();
    this.feedsService.abort();
    this.assets.abort();
    this.admin.abort();
    this.keys.abort();
  }
}
