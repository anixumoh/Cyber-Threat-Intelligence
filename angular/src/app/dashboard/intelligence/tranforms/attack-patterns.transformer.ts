import { Injectable } from '@angular/core';
import { Transformer } from 'app/dashboard/intelligence/tranforms/abstract-transformer.transformer';
import * as moment from 'moment';

/** Class that transform the data from service to BasicInfo  */
@Injectable()
export class AttackPatternsTransformer extends Transformer {
  transformData(data, state: string, currentOrganizationId: number, currentModuleId: number) {
    switch (state) {
      case 'attack-pattern':
        return {
          title: data['name'] ? data['name'] : '',
          name: data['name'] ? data['name'] : '-',
          capec_id: data['capec_id'] ? data['capec_id'] : '-',
          severity: data['severity'] ? data['severity'] : '-',
          purposes: this.listToString(data['purposes']),
          tlp: data['tlp'] ? data['tlp'].toUpperCase() : '-',
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
          tempArray.forEach((it) => {
            it.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/signatures/${it.id}`,
            ];
            it.resourceDataByModule = [
              {
                value: it.attributes.name ? it.attributes.name : '-',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.name ? it.attributes.type : '-',
                elementClass: 'mb-0 text-90 font-weight-normal',
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
                value: it.attributes.name ? it.attributes.version : '-',
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
      case 'attack-phases':
        const tempArrayPattern = [];
        if (Array.isArray(data)) {
          data.forEach((it) => {
            tempArrayPattern.push({
              key: it.name,
              order: it.number,
              value: it.steps
                .map((its) => {
                  return {
                    key: '',
                    order: its.number,
                    value: [
                      {
                        key: 'Name',
                        value: its.name,
                      },
                      {
                        key: 'Description',
                        value: its.description,
                      },
                    ],
                  };
                })
                .sort((x, y) => {
                  return x.order - y.order;
                }),
            });
          });
          tempArrayPattern.sort((x, y) => {
            return x.order - y.order;
          });
        }
        return tempArrayPattern;
      case 'attacker_skills_or_knowledge_required':
        const tempArraySkills = [];
        if (Array.isArray(data)) {
          data.forEach((it) => {
            tempArraySkills.push([
              {
                key: 'Level',
                value: it[0],
              },
              {
                key: 'Description',
                value: it[1],
              },
            ]);
          });
        }
        return tempArraySkills;
      case 'related_vulnerabilities':
        const tempArrayVulnerabilities = [];
        if (Array.isArray(data)) {
          data.forEach((it) => {
            tempArrayVulnerabilities.push([
              {
                key: {
                  value: it[0],
                  isLinkedAttribute: true,
                  url: `http://cve.mitre.org/cgi-bin/cvename.cgi?name=${it[0]}`,
                },
                value: it[1],
              },
            ]);
          });
        }
        return tempArrayVulnerabilities;
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
