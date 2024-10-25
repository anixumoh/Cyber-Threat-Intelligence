import Client from '$lib/client';
import type { CommentType } from '$lib/types/comments';
import type { MessageObjType, ThreatSearchType } from '$lib/types/threat';
import { parseSelectedForDetails } from '$lib/utils/parseData';
import { cloneDeep, isEqual } from 'lodash';
import { writable } from 'svelte/store';
import preferencesStore from './preferences';
import type { Resource, ResourceDetail } from '$lib/types/resource';

type TheatsListType = {
  isLoading: boolean;
  isLoadingDetails: boolean;
  resources: Resource[];
  totalResources: number;
  selectedRowIds: string[];
  selectedResources?: any[];
  messageObj: MessageObjType;
  isOpenDetails: boolean;
  selectedForDetails: ResourceDetail;
  comments: CommentType[];
};

function createThreatsStore() {
  const { subscribe, update, set } = writable<TheatsListType>({
    isLoading: false,
    isLoadingDetails: false,
    resources: [],
    totalResources: 0,
    selectedRowIds: [],
    selectedResources: [],
    messageObj: { msg: 'There are no resources' },
    isOpenDetails: false,
    selectedForDetails: undefined,
    comments: []
  });

  const client = new Client();
  let lastOrganizationId: number;
  let lastModuleId: number;
  let lastFilters: ThreatSearchType;
  let changeResources = true;
  let resourcesForLater = { resources: [], totalResources: 0 };
  let isAllThreats = false;

  function clearLast() {
    lastOrganizationId = lastModuleId = lastFilters = undefined;
    update((obj) => ({
      ...obj,
      resources: [],
      totalResources: 0,
      selectedRowIds: [],
      isLoading: false
    }));
  }

  function restoreResourcesForLater() {
    const { resources, totalResources } = resourcesForLater;
    update((obj) => {
      const messageObj: MessageObjType = { msg: 'There are no resources' };
      const newObj = {
        ...obj,
        resources,
        totalResources,
        selectedRowIds: [],
        isLoading: false,
        messageObj
      };
      return newObj;
    });
  }

  async function loadThreats(
    organizationId: number,
    moduleId: number,
    moduleNameUrl: string,
    filters: ThreatSearchType,
    updateResources = true,
    force = false
  ) {
    if (!force) {
      if (
        isEqual(lastFilters, filters) &&
        organizationId === lastOrganizationId &&
        moduleId === lastModuleId &&
        !isAllThreats
      ) {
        return false;
      }
    }
    update((value) => ({ ...value, isOpenDetails: false, isLoading: true, selectedResources: [], resources: [] }));
    if (updateResources) {
      lastOrganizationId = organizationId;
      lastModuleId = moduleId;
      lastFilters = cloneDeep(filters);
    }
    changeResources = updateResources;
    isAllThreats = false;

    const [_, threatResponse] = await Promise.all([
      changeResources && preferencesStore.setModulePreferences(organizationId, moduleId, filters),
      client.threats.getThreatsResources(organizationId, moduleId, moduleNameUrl, filters)
    ]);

    const { resources, totalResources } = threatResponse;

    if (!changeResources) {
      resourcesForLater = { resources, totalResources };
    }

    update((obj) => {
      let messageObj: MessageObjType = { msg: 'There are no resources' };
      if (!changeResources && !obj.resources.length && totalResources) {
        messageObj = {
          msg: 'There are no relevant resources.',
          count: totalResources
        };
      }
      const newObj = {
        ...obj,
        ...(changeResources ? { resources } : {}),
        totalResources,
        selectedRowIds: [],
        isLoading: false,
        messageObj
      };
      return newObj;
    });
    return true;
  }

  async function loadAllThreats(organizationId: number, filters: ThreatSearchType) {
    if (isEqual(lastFilters, filters) && organizationId === lastOrganizationId && isAllThreats) return;
    update((value) => ({ ...value, isOpenDetails: false, isLoading: true, resources: [] }));
    lastOrganizationId = organizationId;
    lastFilters = cloneDeep(filters);
    isAllThreats = true;

    const { resources, totalResources } = await client.threats.getAllThreatsResources(lastOrganizationId, lastFilters);
    set({
      resources,
      totalResources,
      selectedRowIds: [],
      isLoading: false,
      messageObj: { msg: 'There are no resources' },
      isOpenDetails: false,
      isLoadingDetails: false,
      selectedForDetails: undefined,
      comments: []
    });
  }

  async function loadThreat(
    organizationId: number,
    moduleId: number,
    moduleNameUrl: string,
    resourceId: number,
    url = '',
    isMalware = false
  ) {
    const { data } = await client.threats.getResource(organizationId, moduleId, moduleNameUrl, resourceId);
    let comments: CommentType[] = [];
    if (url) {
      const { data: commentsTmp } = await client.comments.getComments(
        organizationId,
        moduleId,
        moduleNameUrl,
        resourceId,
        url
      );
      comments = commentsTmp;
    }

    const requests = [];
    const summaryTmp = {};
    if (isMalware) {
      const request = await client.threats.getResourceMalware(
        organizationId,
        moduleId,
        moduleNameUrl,
        resourceId,
        'summary'
      );
      const { data: summary } = request;
      Object.entries(summary).forEach?.(([key, value]: any) => {
        if (value) {
          summaryTmp[key] =
            key === 'signatures' ? value.map((signature, index) => ({ id: index + 1, ...signature })) : value;
        }
      });
      ['shared', 'basic-info', 'static', 'dropped', 'behavior'].forEach((infoKey) => {
        requests.push(client.threats.getResourceMalware(organizationId, moduleId, moduleNameUrl, resourceId, infoKey));
      });
    }
    const [shared, basicInfo, staticc, dropped, behavior] = await Promise.all(requests);

    update((obj) => {
      const selectedForDetails = parseSelectedForDetails(
        data,
        isMalware,
        shared?.data,
        basicInfo?.data,
        staticc?.data,
        dropped?.data,
        behavior?.data,
        summaryTmp
      );

      const newObj = {
        ...obj,
        comments,
        selectedForDetails,
        isLoadingDetails: false
      };
      return newObj;
    });
  }

  return {
    clearLast,
    loadThreats,
    loadThreat,
    loadAllThreats,
    restoreResourcesForLater,
    subscribe,
    update,
    set
  };
}

const threatsStore = createThreatsStore();
export default threatsStore;
