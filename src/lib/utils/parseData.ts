import type { ThreatDetail } from '$lib/types/threat';
import { getModuleTypeName } from '.';
import { ellipseUrl, getHumanReadableDate, getLanguageFromId } from './functions';

export const resourcesTypesDictionary = {
  GENERIC: 'Botnet', // deprecated
  BOTNET_CREDENTIALS: 'Botnet',
  HACKTIVISM_CREDENTIALS: 'Hacktivism',
  BOTIP: 'BotIp'
} as const;

// this is for malware details
function parseTcpHosts(hosts: any, tcp: any) {
  return hosts
    .filter((host) => {
      const temp = tcp.find((tcp) => host === tcp.dst);
      return temp;
    })
    .map((host, j) => ({
      address: host,
      port: tcp[j].dport,
      protocol: 'tcp'
    }));
}

// this is for malware details
function parseUdpHosts(hosts: any, udp: any) {
  return hosts
    .filter((host) => {
      const temp = udp.find((tcp) => host === tcp.dst);
      return temp;
    })
    .map((host, j) => ({
      address: host,
      port: udp[j].dport,
      protocol: 'udp'
    }));
}

// this is for malware details
function parseTcpAndUdp(hosts: any, tcp: any, udp: any) {
  return [...parseTcpHosts(hosts, tcp), ...parseUdpHosts(hosts, udp)].map((elem, i) => ({ id: i, ...elem }));
}

// this is for malware details
function parseHttp(http: any[]) {
  return http.map(({ host, port, method = '-', uri = '-', data = '-' }, i) => {
    return { id: i, destination: host ? `${host}:${port}` : '-', method, uri, data };
  });
}

// this is for malware details
function parseDns(dns: any[]) {
  return dns.map(({ request, type, answers }, i) => {
    const response = answers.map((ans) => `${ans.data ? ans.data : '-'} : ${ans.type ? ans.type : '-'}`);
    return { id: i, request, type, response };
  });
}

// this is for malware details
function setIp(domains, domain) {
  const tempDomain = domains.find((element) => element.domain === domain);
  return tempDomain ? tempDomain.ip : '-';
}

// this is for malware details
function parseProtocolsHttp(protocolHttp, domains) {
  return protocolHttp.map(({ host, request, response }, i) => {
    return { id: i, host, request, response, ip: setIp(domains, host) };
  });
}

// this is for malware details
function parseProtocolsTcp(protocolTcp) {
  return protocolTcp.map(({ src = '-', sport = '-', dst = '-', dport = '-' }, i) => {
    return { id: i, src, sport, dst, dport };
  });
}

function staticType(shared: any, staticc: any) {
  if (staticc?.static) {
    if (Object?.keys?.(staticc?.static).length) {
      if (staticc.static.office) {
        return 'office';
        // this.parseOffice();
      } else if (staticc.static.pdf) {
        return 'pdf';
        // this.parsePdf();
      } else {
        // this.parseExe();
        return 'exe';
      }
    } else if (shared?.target?.file?.compressed_files) {
      // this.parseZip();
      return 'zip';
    }
  }
  return 'non-type';
}

export function parseThreatMalwarePreview(shared: any, basicInfo: any) {
  return {
    submitted: getHumanReadableDate(basicInfo.uploadDate),
    architecture: basicInfo?.architecture ?? '-',
    size: basicInfo?.fileSize ?? '-',
    fileType: shared?.target?.file?.type ?? '-',
    md5: shared?.target?.file?.md5 ?? '-',
    sha1: shared?.target?.file?.sha1 ?? '-',
    sha256: shared?.target?.file?.sha256 ?? '-',
    ssdeep: shared?.target?.file?.ssdeep ?? '-'
    // network: {
    //   domains: shared?.network?.domains
    //     ? shared?.network?.domains.map((domain, index) => ({ id: index + 1, ...domain }))
    //     : [],
    //   hosts: parseTcpAndUdp(shared?.network?.hosts ?? [], shared?.network?.tcp ?? [], shared?.network?.udp ?? []),
    //   http: parseHttp(shared?.network?.http ?? []),
    //   dns: parseDns(shared?.network?.dns ?? []),
    //   protocols: {
    //     http: parseProtocolsHttp(shared?.network?.http_ex ?? [], shared?.network?.domains),
    //     https: parseProtocolsHttp(shared?.network?.https_ex ?? [], shared?.network?.domains),
    //     tcp: parseProtocolsTcp(shared?.network?.tcp ?? []),
    //     udp: parseProtocolsTcp(shared?.network?.udp ?? [])
    //   }
    // }
  };
}

export function parseThreatMalwareDetails(shared: any, basicInfo: any, staticc: any, dropped: any, behavior: any) {
  return {
    network: {
      domains: shared?.network?.domains
        ? shared?.network?.domains.map((domain, index) => ({ id: index + 1, ...domain }))
        : [],
      hosts: parseTcpAndUdp(shared?.network?.hosts ?? [], shared?.network?.tcp ?? [], shared?.network?.udp ?? []),
      http: parseHttp(shared?.network?.http ?? []),
      dns: parseDns(shared?.network?.dns ?? []),
      protocols: {
        http: parseProtocolsHttp(shared?.network?.http_ex ?? [], shared?.network?.domains),
        https: parseProtocolsHttp(shared?.network?.https_ex ?? [], shared?.network?.domains),
        tcp: parseProtocolsTcp(shared?.network?.tcp ?? []),
        udp: parseProtocolsTcp(shared?.network?.udp ?? [])
      }
    },
    header: {
      packer: staticc?.blueliv?.packer ? staticc.blueliv.packer : '-',
      yara: shared?.target?.file?.yara.length ? shared?.target?.file?.yara.map((e) => e.name).join(', ') : '-'
    },
    staticc: {
      type: staticType(shared, staticc),
      pe_sections: staticc?.static?.pe_sections
        ? staticc.static.pe_sections.map((section, index) => ({ id: index + 1, ...section }))
        : [],
      compressed_files: shared?.target?.file?.compressed_files,
      pe_imports: staticc?.static?.pe_imports,
      office: staticc?.static?.office,
      pdf: staticc?.static?.pdf
    },
    dropped: dropped,
    behavior: behavior.behavior
  };
}

export function parseThreatResource(row: ThreatDetail, index = 1, isForTable = true) {
  const {
    id,
    md5,
    url,
    title,
    file_name,
    analysis_calc_result,
    analysis_user_result,
    changed_at,
    checked_at,
    created_at,
    updated_at,
    user_rating,
    read,
    fav,
    followedUp,
    userModified,
    issued,
    labels,
    searchPhrase,
    search_words,
    sourceType,
    tlpStatus,
    email,
    employee,
    customer,
    external,
    language_id,
    num_cred,
    num_cards,
    targeted,
    status,
    platform,
    file_size,
    upload_date,
    av_ratio,
    severity,
    module_id,
    module_type,
    module_name,
    module_short_name,
    countries_id,
    transform,
    resource_type,
    domain_type,
    sources,
    content_type,
    file,
    domain,
    malwareType,
    total_retweets,
    retweet_info,
    history,
    metadata,
    credential,
    credentials,
    credit_cards,
    leakFoundAt,
    leakOrigin,
    leakDate,
    uploadDate,
    affectedFields
  } = row;
  return {
    id: `${id || md5}-${module_id}`,
    resourceId: id,
    tlpStatus,
    sourceType,
    labels,
    read,
    status,
    severity, // for malware
    transform,
    file, // for preview
    domain, // for preview,
    malwareType, // for preview
    followedUp, // for details
    userModified,
    history,
    metadata,
    credentials,
    leakFoundAt,
    leakOrigin,
    leakDate: getHumanReadableDate(leakDate),
    affectedFields,
    changedAt: getHumanReadableDate(changed_at),
    checkedAt: getHumanReadableDate(checked_at),
    createdAt: getHumanReadableDate(created_at),
    updatedAt: getHumanReadableDate(updated_at),
    selectedCountry: countries_id || '-',
    moduleId: module_id || 0,
    moduleType: getModuleTypeName(module_type || ''),
    moduleName: module_name || '',
    moduleShortName: module_short_name || '',
    title: title || file_name || '(No title)',
    phraseIcon: searchPhrase || '',
    rating: user_rating || 0,
    date: changed_at,
    inform: analysis_user_result || analysis_calc_result,
    hasIncident: issued || false,
    favorite: fav,
    url: ellipseUrl(url || '-', 40),
    originalUrl: url || '-',
    email: isForTable ? (email !== 0 ? '✔' : '-') : email,
    employee: isForTable ? (employee !== 0 ? '✔' : '-') : employee,
    customer: isForTable ? (customer !== 0 ? '✔' : '-') : customer,
    external: isForTable ? (external !== 0 ? '✔' : '-') : external,
    searchPhrase: searchPhrase || '-',
    searchWords: search_words?.length ? search_words[0] : '-',
    searchWordsViewDetails: search_words?.length ? search_words.join(', ') : '-',
    language: language_id ? getLanguageFromId(language_id) || '-' : '-',
    languageId: language_id,
    numCards: num_cred || num_cards || 0,
    targeted: targeted ? 'TARGETED' : status || '-', // for malware
    platform, // for malware
    fileSize: file_size, // for malware
    uploadDate: getHumanReadableDate(upload_date || uploadDate) || '-', // for malware
    avRatio: av_ratio || '-', // for malware
    userSubmited: labels.findIndex((label) => label.name === 'User Submitted') > -1,
    resourceType: (resourcesTypesDictionary[resource_type] ?? '-') as
      | typeof resourcesTypesDictionary[keyof typeof resourcesTypesDictionary]
      | '-',
    analysisCalcResult: analysis_calc_result || '-', // for preview
    domainType: domain_type ? `${domain_type.substr(0, 1).toUpperCase()}${domain_type.substr(1).toLowerCase()}` : '-',
    sources: sources?.length ? sources : [], // for preview
    contentType: content_type ?? '-', // for preview,
    totalRetweets: total_retweets ?? 0,
    retweetInfo: retweet_info ?? undefined,
    creditCards: credit_cards ?? [],
    credential
  };
}

export function parseIncidentResource(row: any) {
  const { id, title, labels, status, numberOfAnalyzedResources, lastUpdateUser, creationDate, changedAt, user } = row;
  return {
    id,
    title,
    status,
    numberOfAnalyzedResources,
    lastUpdateUser,
    creationDate: getHumanReadableDate(creationDate),
    changedAt: getHumanReadableDate(changedAt),
    assignee: user?.username || '',
    labels: labels.map((label) => {
      label.background_color = label.bgColor;
      label.text_color = label.textColor;
      return label;
    })
  };
}

export function parseSelectedForDetails(
  data: ThreatDetail,
  isMalware: boolean,
  shared: any,
  basicInfo: any,
  staticc: any,
  dropped: any,
  behavior: any,
  summaryTmp: any
) {
  return {
    ...parseThreatResource(data, 1, false),
    ...(isMalware ? parseThreatMalwarePreview(shared, basicInfo) : {}),
    ...(isMalware ? parseThreatMalwareDetails(shared, basicInfo, staticc, dropped, behavior) : {}),
    ...(isMalware ? { summary: summaryTmp } : {})
  };
}
