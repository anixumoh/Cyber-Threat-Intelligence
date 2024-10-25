import { Injectable } from '@angular/core';
import { Transformer } from 'app/dashboard/intelligence/tranforms/abstract-transformer.transformer';
import * as moment from 'moment';

/** Class that transform the data from service to BasicInfo  */
@Injectable()
export class CrimeServersTransformer extends Transformer {
  transformData(data, state: string, currentOrganizationId: number, currentModuleId: number) {
    switch (state) {
      case 'crime-server':
        return {
          title: data['crime_server_url'] ? data['crime_server_url'] : 'Crime Server',
          status: data['status'] ? data['status'] : '-',
          types: this.listToString(data['types']),
          tlp: data['tlp'] ? data['tlp'].toUpperCase() : '-',
          firstSeen: moment(data['first_seen'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
          lastSeen: moment(data['last_seen'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
          score: {
            score: data['risk'] != null ? data['risk'] : 0,
            id: data['crime_server_url'],
          },
        };
      case 'malware':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
          return tempArray;
        });
      case 'fqdn':
        return this.defaultObjectBehaviour(data, () => {
          let tempArray = data.data;
          return tempArray;
        });
      case 'ioc':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
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
              },
            ];
          });
          return {
            value: tempArray,
            totalResources: data.meta.pagination.count,
          };
        });
      case 'source':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
          tempArray.forEach(it => {
            it.name = it.attributes.name ? it.attributes.name : '-';
            (it.createt_at = moment(it.attributes.created_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'));
            (it.keyword = it.attributes.keyword ? it.attributes.keyword : null);
            if (it.name.toLowerCase() === 'malware' && it.keyword) {
              it.customLink = [
                `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/indicators/malware/resource/${it.keyword}`,
              ];
            }
          });
          return tempArray;
        });
      case 'spark':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
          tempArray.forEach(it => {
            it.name = it.attributes.name ? it.attributes.name : '-';
            it.tlp = it.attributes.tlp ? it.attributes.tlp.toUpperCase() : 'WHITE';
            it.customLink = `https://community.blueliv.com/#!/s/${it.attributes.community_id}`;
            it.sparkTags = it.attributes.tags.map(tag => {
              return {
                name: tag,
                customLink: `https://community.blueliv.com/#!/discover?tags=${tag.toLowerCase()}`,
              };
            });
          });
          return tempArray;
        });
      default:
        break;
    }
  }
}
