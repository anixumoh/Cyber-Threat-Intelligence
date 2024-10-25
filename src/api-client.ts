import { handle429Response } from '$lib/utils/functions';
import logout from '$lib/utils/logout';
import token from '$stores/token';
import axios from 'axios';
import { get } from 'svelte/store';

axios.interceptors.request.use(
  (config) => {
    config.params = { ...config.params, notcache: new Date().getTime() };
    const tokenValue = get(token);
    if (tokenValue) {
      config.headers['x-cookie'] = tokenValue;
    }
    config.withCredentials = true;
    config.headers.uirequest = true;
    config.headers['Content-Type'] ??= 'application/json';
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response.status === 401) {
        await logout();
        throw new axios.Cancel();
      }
      handle429Response(error.response);
    }
    return Promise.reject(error);
  }
);
