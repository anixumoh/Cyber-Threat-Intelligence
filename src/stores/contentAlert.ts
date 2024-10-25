import type { ContentAlertItemType, Contentype } from '$lib/types/settings';
import axios from 'axios';
import { writable } from 'svelte/store';

function createContentAlertStore() {
  const { subscribe, update, set } = writable<Contentype>({
    defaultResponse: {
      CUSTOM: [],
      DOMAIN_PROTECTION: [],
      CREDIT_CARDS_FULL: [],
      MOBILE_APPS: [],
      CREDENTIALS: [],
      DATA_LEAKAGE: [],
      SOCIAL_MEDIA: [],
      HACKTIVISM: [],
      MEDIA_TRACKER: [],
      DARK_WEB: [],
      THREAT_CONTEXT: [],
      EXPLORER: []
    },
    response: {
      CUSTOM: [],
      DOMAIN_PROTECTION: [],
      CREDIT_CARDS_FULL: [],
      MOBILE_APPS: [],
      CREDENTIALS: [],
      DATA_LEAKAGE: [],
      SOCIAL_MEDIA: [],
      HACKTIVISM: [],
      MEDIA_TRACKER: [],
      DARK_WEB: [],
      THREAT_CONTEXT: [],
      EXPLORER: []
    },
    contentSplited: [],
    selected: [],
    editing: false,
    sendAlert: false
  });

  async function getAlertContent(organizationId: number) {
    const url = `/api/v2/alert_configs/organization/${organizationId}/alert_content`;
    const res = await axios.get(url);
    if (res.status === 200) {
      update((obj) => {
        const newObj = {
          ...obj,
          defaultResponse: res.data,
          response: res.data
        };
        return newObj;
      });
    }
  }

  function updateSelected(moduleType: string) {
    update((obj) => {
      let selected = [];
      obj.response[moduleType]
        ?.filter?.(({ enable }) => enable)
        .forEach(({ name }) => (selected = [...selected, name]));

      const newObj = {
        ...obj,
        selected
      };
      return newObj;
    });
  }

  function updateFromEditContentAlerts(moduleType: string, content: ContentAlertItemType[]) {
    update((obj) => {
      const newResponse = obj.response[moduleType].map((item) => ({
        ...item,
        enable: content.find((it) => item.name === it.name).enable
      }));
      const response = {
        ...obj.response,
        [moduleType]: newResponse
      };

      const newObj = {
        ...obj,
        response
      };
      return newObj;
    });
  }

  function updateFromNewContentAlerts(moduleType: string) {
    update((obj) => {
      const response = {
        ...obj.response,
        [moduleType]: obj.defaultResponse[moduleType]
      };

      const newObj = {
        ...obj,
        response
      };
      return newObj;
    });
  }

  return {
    subscribe,
    update,
    set,
    getAlertContent,
    updateFromEditContentAlerts,
    updateFromNewContentAlerts,
    updateSelected
  };
}

const contentAlertStore = createContentAlertStore();

export default contentAlertStore;
