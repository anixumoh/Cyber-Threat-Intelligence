import { Injectable } from '@angular/core';
import { Transformer } from 'app/dashboard/intelligence/tranforms/abstract-transformer.transformer';
import * as moment from 'moment';

/** Class that transform the data from service to BasicInfo  */
@Injectable()
export class SignaturesTransformer extends Transformer {
  transformData(data, state: string, currentOrganizationId: number, currentModuleId: number) {
    switch (state) {
      case 'signature':
        return {
          title: data['name'] ? data['name'] : '',
          name: data['name'] ? data['name'] : '-',
          type: data['type'] ? data['type'] : '-',
          tlp: data['tlp'] ? data['tlp'].toUpperCase() : '-',
          version: data['version'] ? data['version'] : '-',
          sid: data['sid'] ? data['sid'] : '-',
          createdAt: moment(data['created_at'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        };
      case 'threat-actor':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach((it) => {
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
          tempArray.forEach((it) => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/tools/${it.id}`,
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
      case 'tool':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach((it) => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/tool/resource/${it.id}`,
            ];
            it.resourceDataByModule = [
              {
                value: it.attributes.name ? it.attributes.name : '-',
                elementClass: 'mb-0 text-90 font-weight-normal',
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
      case 'attack-pattern':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach((it) => {
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
      case 'cve':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach((it) => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/cves/${it.attributes.name}`,
            ];
            it.resourceDataByModule = [
              {
                value: it.attributes.name ? it.attributes.name : '-',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: moment(it.attributes.created_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                isScore: true,
                value: it.attributes.score != null ? it.attributes.score : 0,
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                icon: true,
                iconClass:
                  it.attributes.exploits && it.attributes.exploits.length
                    ? 'icon-check text-success'
                    : 'icon-close text-danger',
                class: 'td-center',
              },
              {
                icon: true,
                iconClass:
                  it.attributes.platforms && it.attributes.platforms.length
                    ? 'icon-check text-success'
                    : 'icon-close text-danger',
                class: 'td-center',
              },
              {
                icon: true,
                iconClass:
                  it.attributes.microsoft_bulletins && it.attributes.microsoft_bulletins.length
                    ? 'icon-check text-success'
                    : 'icon-close text-danger',
                class: 'td-center',
              },
              {
                value: it.attributes.num_malware != null ? it.attributes.num_malware : '',
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
