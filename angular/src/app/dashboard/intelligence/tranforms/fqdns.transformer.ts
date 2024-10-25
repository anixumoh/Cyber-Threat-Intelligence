import { Injectable } from '@angular/core';
import { Transformer } from 'app/dashboard/intelligence/tranforms/abstract-transformer.transformer';
import { prettifyObject } from 'app/utils/functions';
import * as moment from 'moment';

/** Class that transform the data from service to BasicInfo  */
@Injectable()
export class FqdnsTransformer extends Transformer {
  mockIOC: any = {
    data: [
      {
        type: 'Indicator',
        id: '5806119',
        attributes: {
          created_at: '2017-12-02T08:41:54.745947Z',
          type: 'IP',
          updated_at: '2017-12-02T08:41:54.746001Z',
          value: '67.229.100.20',
        },
      },
      {
        type: 'Indicator',
        id: '5506173',
        attributes: {
          created_at: '2017-12-07T19:06:29.692526Z',
          type: 'IP',
          updated_at: '2017-12-07T19:06:29.692558Z',
          value: '2.17.122.210',
        },
      },
      {
        type: 'Indicator',
        id: '413176',
        attributes: {
          created_at: '2017-11-03T23:27:15.865899Z',
          type: 'Fqdn',
          updated_at: '2017-11-03T23:27:15.865963Z',
          value: 'r.pengyou.com',
        },
      },
      {
        type: 'Indicator',
        id: '10162',
        attributes: {
          created_at: '2017-12-07T19:06:29.692526Z',
          type: 'IP',
          updated_at: '2017-12-07T19:06:29.692558Z',
          value: '8.8.8.8',
        },
      },
    ],
  };

  mockHISTORY: any = {
    data: [
      {
        type: 'HistoryItem',
        id: '386238',
        attributes: {
          first_seen: '2018-01-09T00:00:00Z',
          type: 'Attacking IP',
          last_seen: '2018-01-09T00:00:00Z',
          description: 'RANDOM_SYN_ATTACK',
        },
      },
      {
        type: 'HistoryItem',
        id: '386238',
        attributes: {
          first_seen: '2018-01-09T00:00:00Z',
          type: 'Attacking IP',
          last_seen: '2018-01-09T00:00:00Z',
          description: 'RANDOM_SYN_ATTACK',
        },
      },
      {
        type: 'HistoryItem',
        id: '386238',
        attributes: {
          first_seen: '2018-01-09T00:00:00Z',
          type: 'Attacking IP',
          last_seen: '2018-01-09T00:00:00Z',
          description: 'RANDOM_SYN_ATTACK',
        },
      },
      {
        type: 'HistoryItem',
        id: '386238',
        attributes: {
          first_seen: '2018-01-09T00:00:00Z',
          type: 'Attacking IP',
          last_seen: '2018-01-09T00:00:00Z',
          description: 'RANDOM_SYN_ATTACK',
        },
      },
    ],
  };

  mockExternal: any = {
    data: {
      attributes: {
        scans: [
          {
            detected: true,
            result: 'Trojan.Generic.6923327',
            vendor: 'Ad-Aware',
          },
          {
            detected: true,
            result: 'Troj.W32.Vilsel.lRrw',
            vendor: 'AegisLab',
          },
          {
            detected: true,
            result: 'Trojan/Win32.Vilsel',
            vendor: 'AhnLab-V3',
          },
          {
            detected: true,
            result: 'Trojan.Generic.6923327',
            vendor: 'ALYac',
          },
          {
            detected: true,
            result: 'Trojan/Win32.Vilsel',
            vendor: 'Antiy-AVL',
          },
          { vendor: 'Alibaba', detected: false, result: null },
          { vendor: 'Baidu-International', detected: false, result: null },
          { vendor: 'Kingsoft', detected: false, result: null },
          { vendor: 'Malwarebytes', detected: false, result: null },
          { vendor: 'Zoner', detected: false, result: null },
        ],
      },
    },
  };

  mockACTIVEDNS: any = {
    data: {
      attributes: {
        A: [
          {
            preference: null,
            record_class: 'IN',
            ttl: 300,
            type: 'A',
            value: '204.11.56.48',
          },
          {
            preference: null,
            record_class: 'TEST',
            ttl: 500,
            type: 'A',
            value: '1.1.1.1',
          },
        ],
        AAAA: [
          {
            preference: null,
            record_class: 'TEST1',
            ttl: 600,
            type: 'AAAA',
            value: '1.1.1.1',
          },
          {
            preference: null,
            record_class: 'TEST2',
            ttl: 900,
            type: 'AAAA',
            value: '1.1.1.2',
          },
        ],
        CNAME: [
          {
            first_seen: null,
            last_seen: '2016-10-17 00:00:00',
            resolution: 'qvokybzv.gdn',
          },
        ],
        MX: [
          {
            first_seen: null,
            last_seen: '2016-10-17 00:00:00',
            resolution: 'qvokybzv.gdn',
          },
        ],
      },
      type: 'DNSReport',
      id: '!26.com',
    },
  };

  mockPASSIVEDNS: any = {
    data: {
      attributes: {
        resolutions: [
          {
            first_seen: null,
            last_seen: '2016-10-17 00:00:00',
            resolution: 'qvokybzv.gdn',
          },
          {
            first_seen: null,
            last_seen: '2016-08-15 00:00:00',
            resolution: 'rmonkeyb.racing',
          },
        ],
      },
      type: 'WhoisReport',
      id: '1.0.110.149',
    },
  };

  mockWHOIS: any = {
    data: {
      type: 'WhoisReport',
      id: '1.0.110.149',
      attributes: {
        asn: '18144',
        asn_cdir: '1.0.64.0/18',
        asn_cidr: 'JP',
        asn_country_code: '2017-12-02T08:41:54.746001Z',
        asn_date: '2011-04-12',
        asn_description: 'AS-ENECOM Energia Communications,Inc., JP',
        asn_registry: 'apnic',
        network: {
          cidr: '1.1.128.0/18',
          country: 'TH',
          end_address: '1.1.191.255',
          events: [
            {
              action: 'last changed',
              actor: null,
              timestamp: '2014-05-28T07:07:23Z',
            },
          ],
          handle: '1.1.128.0 - 1.1.191.255',
          ip_version: 'v4',
          name: 'TOTNET',
          parent_handle: '1.1.128.0 - 1.1.255.255',
          start_address: '1.1.128.0',
          status: null,
          type: 'ASSIGNED NON-PORTABLE',
        },
      },
    },
  };

  mockEXTERNAL: any = {
    data: {
      attributes: {
        miscs: {},
        pcaps: [
          {
            pcap: 'test',
          },
          {
            pcap: 'test2',
          },
        ],
        resolutions: [
          {
            first_seen: null,
            last_seen: '2016-10-17 00:00:00',
            resolution: 'qvokybzv.gdn',
          },
        ],
        urls: [
          {
            url: 'http://v32c-to-5-8w-0yc-tzl8-h2a-7f-ezc-oxt1-7-8y-0elh-be-3k-d.info/',
            last_seen: '2017-11-16 13:03:02',
            positives: 5,
            detections: 65,
          },
        ],
        samples: [
          {
            'sha-256': 'http://v32c-to-5-8w-0yc-tzl8-h2a-7f-ezc-oxt1-7-8y-0elh-be-3k-d.info/',
            type: 'test',
            last_seen: '2017-11-16 13:03:02',
            positives: 5,
            detections: 65,
          },
        ],
        misc: {
          'webutation domain info': {
            'Adult content': 'no',
            'Safety score': 70,
            Verdict: 'unsure',
          },
          categories: ['known infection source', 'uncategorized'],
        },
      },
      type: 'DomainReport',
      id: 'v32c-to-5-8w-0yc-tzl8-h2a-7f-ezc-oxt1-7-8y-0elh-be-3k-d.info',
    },
  };

  transformData(data, state: string, currentOrganizationId: number, currentModuleId: number) {
    switch (state) {
      case 'fqdn':
        return {
          title: data['domain'] ? data['domain'] : 'Domain',
          firstSeen: moment(data['created_at'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
          lastSeen: moment(data['updated_at'], 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
          score: {
            score: data['risk'] != null ? data['risk'] : 0,
            id: data['domain'],
          },
        };
      case 'malware':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
          return tempArray;
        });
      case 'crime-server':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
          return tempArray;
        });
      case 'ip':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
          return tempArray;
        });
      case 'threat-actor':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
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
          return tempArray;
        });
      case 'campaign':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
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
      case 'history':
        return this.defaultBehaviour(data, () => {
          let tempArray = data.data;
          tempArray.forEach(it => {
            it.resourceDataByModule = [
              {
                isScore: true,
                value: it.attributes.risk != null ? it.attributes.risk : '',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.subtype
                  ? it.attributes.subtype === 'IP' || it.attributes.subtype === 'Fqdn'
                    ? it.attributes.subtype.toUpperCase()
                    : it.attributes.subtype
                  : '-',
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value:
                  it.attributes.ioc_types && it.attributes.ioc_types.length ? it.attributes.ioc_types.join(', ') : '-',
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: it.attributes.description ? it.attributes.description : '-',
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: moment(it.attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
              {
                value: moment(it.attributes.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                class: 'td-center',
                elementClass: 'mb-0 text-90 font-weight-normal',
              },
            ];
          });
          return tempArray;
        });
      case 'dns':
        return this.defaultObjectBehaviour(data, () => {
          // return this.defaultObjectBehaviour(this.mockACTIVEDNS,()=>{
          let tempArray = data.data;
          // let tempArray = this.mockACTIVEDNS.data.attributes;
          if (tempArray.attributes) {
            let attributes = tempArray.attributes;
            for (let property in attributes) {
              attributes[property].forEach(it => {
                it.resourceDataByModule = [
                  {
                    value: it.record_class ? it.record_class : '-',
                    elementClass: 'mb-0 text-90 font-weight-normal',
                  },
                  {
                    value: it.value ? it.value : '-',
                    class: 'text-center',
                    elementClass: 'mb-0 text-90 font-weight-normal',
                  },
                  {
                    value: it.ttl ? it.ttl : '-',
                    class: 'text-center',
                    elementClass: 'mb-0 text-90 font-weight-normal',
                  },
                ];
              });
            }
            return attributes;
          } else {
            return [];
          }
        });
      case 'passive-dns':
        return this.defaultObjectBehaviour(data, () => {
          // return this.defaultObjectBehaviour(this.mockPASSIVEDNS,()=>{
          let tempArray = data.data;
          // let tempArray = this.mockPASSIVEDNS;
          if (tempArray.attributes && tempArray.attributes.resolutions && tempArray.attributes.resolutions.length) {
            let resolutions = tempArray.attributes.resolutions;
            resolutions.forEach(it => {
              it.resourceDataByModule = [
                {
                  value: it.resolution ? it.resolution : '-',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
                {
                  value: moment(it.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                  class: 'text-center',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
              ];
            });
            return resolutions;
          } else {
            return [];
          }
        });
      case 'whois':
        return this.defaultObjectBehaviour(data, () => {
          // return this.defaultObjectBehaviour(this.mockWHOIS,()=>{
          let tempArray = data.data;
          // let tempArray = this.mockWHOIS.data;
          if (tempArray.attributes) {
            let attributes = tempArray.attributes;
            if (attributes.raw) {
              return [attributes.raw];
            } else {
              let result = prettifyObject.call(this, attributes);
              return [result];
            }
          } else {
            return [];
          }
        });
      case 'virus-total':
        return this.defaultObjectBehaviour(data, () => {
          // return this.defaultObjectBehaviour(this.mockEXTERNAL,()=>{
          let tempArray = data.data;
          // let tempArray = this.mockEXTERNAL.data.attributes;
          if (tempArray.attributes) {
            let attributes = tempArray.attributes;
            attributes['pcaps'].forEach(it => {
              it.resourceDataByModule = [
                {
                  value: it.pcap ? it.pcap : '-',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
              ];
            });

            attributes['resolutions'].forEach(it => {
              it.resourceDataByModule = [
                {
                  value: it.resolution ? it.resolution : '-',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
                {
                  value: moment(it.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                  class: 'text-center',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
              ];
            });

            attributes['urls'].forEach(it => {
              it.resourceDataByModule = [
                {
                  value: it.url ? it.url : '-',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
                {
                  value: moment(it.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                  class: 'text-center',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
                {
                  value: it.detections != null ? it.detections : '-',
                  class: 'text-center',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
                {
                  value: it.positives != null ? it.positives : '-',
                  class: 'text-center',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
              ];
            });

            attributes['samples'].forEach(it => {
              it.resourceDataByModule = [
                {
                  value: it['sha-256'] ? it['sha-256'] : '-',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
                {
                  value: moment(it.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
                  class: 'text-center',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
                {
                  value: it.detections != null ? it.detections : '-',
                  class: 'text-center',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
                {
                  value: it.positives != null ? it.positives : '-',
                  class: 'text-center',
                  elementClass: 'mb-0 text-90 font-weight-normal',
                },
              ];
            });

            attributes['misc'] = prettifyObject.call(this, attributes['misc']);

            return attributes;
          } else {
            return {
              pcaps: [],
              resolutions: [],
              urls: [],
              samples: [],
            };
          }
        });
      default:
        break;
    }
  }
}