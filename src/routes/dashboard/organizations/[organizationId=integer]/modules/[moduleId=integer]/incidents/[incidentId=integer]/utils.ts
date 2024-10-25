import { MODULE_NAME } from '$lib/constants/modules';
import type Module from '$lib/types/module';

export function checkUrl(url: string) {
  const regex = new RegExp('^(botnet|hacktivism)');
  if (url.match(regex)) {
    return '-';
  }
  return url;
}

export function resourceUrl(orgId: number, module: Module, resourceId: number) {
  if (module.moduleName === MODULE_NAME.MALWARE) {
    return `/dashboard/organizations/${orgId}/modules/${module.id}/resource/malware/${resourceId}`;
  }
  return `/dashboard/organizations/${orgId}/modules/${module.id}/resource/${resourceId}`;
}
