import { Injectable } from '@angular/core';
import { Transformer } from 'app/dashboard/intelligence/tranforms/abstract-transformer.transformer';
import * as moment from 'moment';

/** Class that transform the data from service to BasicInfo  */
@Injectable()
export class CveTransformer extends Transformer {
  transformData(data, state: string, currentOrganizationId: number, currentModuleId: number) {
    switch (state) {
      case 'cve':
        return {
          title: data['name'] ? data['name'] : '',
          name: data['name'] ? data['name'] : '-',
          createdAt: moment(data['published_at'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
          cvss: data['cvss'] ? data['cvss'] : '',
          score: {
            score: data['score'] != null ? data['score'] : 0,
            id: data['name'],
          },
        };
      case 'attack-pattern':
        return this.defaultBehaviour(data, () => {
          const tempArray: any = data.data;
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
                value: it.attributes.type ? it.attributes.type : '-',
                class: 'td-center',
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
      case 'spark':
        return this.defaultBehaviour(data, () => {
          const tempArray = data.data;
          tempArray.forEach(item => {
            item.name = item.attributes.name ? item.attributes.name : '-';
            item.tlp = item.attributes.tlp ? item.attributes.tlp.toUpperCase() : 'WHITE';
            item.customLink = `https://community.blueliv.com/#!/s/${item.attributes.community_id}`;
            item.sparkTags = item.attributes.tags.map(tag => {
              return {
                name: tag,
                customLink: `https://community.blueliv.com/#!/discover?tags=${tag.toLowerCase()}`,
              };
            });
          });
          return tempArray;
        });
      case 'security-updates':
        const securityUpdatesArray = data;
        if (Array.isArray(data)) {
          securityUpdatesArray.forEach(item => {
            item.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/security-updates/resource/${item.id}`,
            ];
            item.resourceDataByModule = [
              item.name ? item.name : '-',
              item.impact ? item.impact : '-',
              item.severity ? item.severity : '-',
              item.knowledgebase_SOURCE_FILE ? item.knowledgebase_SOURCE_FILE : '-',
              item.bulletin_SOURCE_FILE ? item.bulletin_SOURCE_FILE : '-',
              item.knowledgebase_id ? item.knowledgebase_id : '-',
              item.cves_url ? item.cves_url : '-',
              this.formatDate(item.publishedDate),
            ];
          });
        }
        return securityUpdatesArray;
      case 'platforms':
        const platformArray = data;
        if (Array.isArray(data)) {
          platformArray.forEach(item => {
            item.customLink = [
              `/dashboard/organizations/${currentOrganizationId}/modules/${currentModuleId}/threat_context/signatures/${item.id}`,
            ];
            item.resourceDataByModule = [{ value: item.title ? item.title : '-' }, { value: item.id ? item.id : '-' }];
          });
        }
        return platformArray;
      case 'exploits':
        const exploitsArray = data;
        if (Array.isArray(data)) {
          exploitsArray.forEach(item => {
            item.resourceDataByModule = [
              { value: item.name ? item.name : '-' },
              { value: item.author ? item.author : '-' },
              { value: item.type ? item.type : '-' },
              { value: item.platform ? item.platform : '-' },
              { value: item.port ? item.port : '-' },
              { value: item.url ? this.getDomain(item.url) : '-' },
              { isUrl: item.url ? item.url : '-' },
            ];
          });
        }

        return exploitsArray;
      default:
        break;
    }
  }

  private getDomain(url: string) {
    const result = url
      .substr(0, url.lastIndexOf('.'))
      .replace('www.', '')
      .replace('https://', '')
      .split('.');
    return result[0];
  }
}
