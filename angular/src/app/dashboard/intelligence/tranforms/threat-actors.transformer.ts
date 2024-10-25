import { Injectable } from '@angular/core';
import { Transformer } from 'app/dashboard/intelligence/tranforms/abstract-transformer.transformer';
import * as moment from 'moment';

/** Class that transform the data from service to BasicInfo  */
@Injectable()
export class ThreatActorsTransformer extends Transformer {
  transformData(data, state: string, currentOrganizationId: number, currentModuleId: number) {
    switch (state) {
      case 'threat-actor':
        return {
          title: data['name'] ? data['name'] : '',
          active: this.getStatus(data),
          types: this.listToString(data['types']),
          sophistication: this.capitalizeFirstLetter(data['sophistication']),
          tlp: data['tlp'] ? data['tlp'].toUpperCase() : '-',
          firstSeen: moment(data['first_seen'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
          lastSeen: moment(data['last_seen'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        };
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
      case 'attack-pattern':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach(it => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/attack-patterns/${it.id}`,
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
                value: it.attributes.severity ? it.attributes.severity : '-',
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
                value: it.attributes.tlp ? it.attributes.tlp.toUpperCase() : '-',
                isTLP: true,
                class: 'td-center',
              },
              {
                value: moment(it.attributes.created_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
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
      case 'tool':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach(it => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/tools/${it.id}`,
            ];
            it.resourceDataByModule = [
              {
                value: it.attributes.name ? it.attributes.name : '-',
              },
              {
                value: it.attributes.version ? it.attributes.version : '-',
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.tlp ? it.attributes.tlp.toUpperCase() : '-',
                isTLP: true,
                class: 'td-center',
              },
            ];
          });
          return {
            value: tempArray,
            totalResources: data.meta.pagination.count,
          };
        });
      case 'ioc':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach(it => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/${(it.type as string).toLowerCase()}/${(it
                .attributes.type as string).toLowerCase()}/resource/${
                it.attributes.type === 'Malware' || it.attributes.type === 'IP' ? it.attributes.value : it.id
              }`,
            ];
            it.resourceDataByModule = [
              {
                value: it.attributes.value ? it.attributes.value : '-',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                isScore: true,
                value: it.attributes.risk != null ? it.attributes.risk : '',
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.type
                  ? it.attributes.type === 'IP' || it.attributes.type === 'Fqdn'
                    ? it.attributes.type.toUpperCase()
                    : it.attributes.type
                  : '-',
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.ioc_types ? it.attributes.ioc_types : '-',
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: moment(it.attributes.created_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: moment(it.attributes.updated_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
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
      default:
        break;
    }
  }
}
