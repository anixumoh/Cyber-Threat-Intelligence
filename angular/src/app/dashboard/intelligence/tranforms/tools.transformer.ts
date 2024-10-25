import { Injectable } from '@angular/core';
import { Transformer } from 'app/dashboard/intelligence/tranforms/abstract-transformer.transformer';
import * as moment from 'moment';

/** Class that transform the data from service to BasicInfo  */
@Injectable()
export class ToolsTransformer extends Transformer {
  transformData(data, state: string, currentOrganizationId: number, currentModuleId: number) {
    switch (state) {
      case 'tool':
        return {
          title: data['name'] ? data['name'] : '',
          name: data['name'] ? data['name'] : '-',
          version: data['version'] ? data['version'] : '-',
          tlp: data['tlp'] ? data['tlp'].toUpperCase() : '-',
          first_seen: moment(data['first_seen'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
          last_seen: moment(data['last_seen'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
          targeted_platforms: data['targeted_platforms'].length ? data['targeted_platforms'].join(', ') : '-',
        };
      case 'threat-actor':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach(it => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/actors/${it.id}`,
            ];
            it.resourceDataByModule = [
              {
                value: it.attributes.name ? it.attributes.name : '-',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.tlp ? it.attributes.tlp.toUpperCase() : '-',
                isTLP: true,
                class: 'td-center',
              },
              {
                value: moment(it.attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
            ];
          });
          return {
            value: tempArray,
            totalResources: data.meta.pagination.count,
          };
        });
      case 'campaign':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach(it => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/campaigns/${it.id}`,
            ];
            it.resourceDataByModule = [
              {
                value: it.attributes.name ? it.attributes.name : '-',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.tlp ? it.attributes.tlp.toUpperCase() : '-',
                isTLP: true,
                class: 'td-center',
              },
              {
                value: moment(it.attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
            ];
          });
          return {
            value: tempArray,
            totalResources: data.meta.pagination.count,
          };
        });
      case 'signature':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach(it => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/signatures/${it.id}`,
            ];
            it.resourceDataByModule = [
              {
                value: it.attributes.name ? it.attributes.name : '-',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.type ? it.attributes.type : '-',
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              moment(data[it.attributes.created_at], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
            ];
          });
          return {
            value: tempArray,
            totalResources: data.meta.pagination.count,
          };
        });
      default:
        break;
    }
  }
}
