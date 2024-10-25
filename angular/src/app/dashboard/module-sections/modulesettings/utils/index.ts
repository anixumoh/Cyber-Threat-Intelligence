export const MODULE_NAME = {
  SOCIAL_MEDIA: 'social_media',
  CUSTOM: 'custom',
  MOBILE_APPS: 'mobile_apps',
  CREDENTIAL: 'credential',
  THREAT_CONTEXT: 'threat_context',
  EXPLORER: 'explorer'
};

export const regexDomain = new RegExp(
  '^' +
    '(?:' +
    // IP address exclusion
    // private & local networks
    '(?!10(?:\\.\\d{1,3}){3})' +
    '(?!127(?:\\.\\d{1,3}){3})' +
    '(?!169\\.254(?:\\.\\d{1,3}){2})' +
    '(?!192\\.168(?:\\.\\d{1,3}){2})' +
    '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
    '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
    '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
    '|' +
    // IPv6 RegEx - http://stackoverflow.com/a/17871737/273668
    '\\[(' +
    '([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|' + // 1:2:3:4:5:6:7:8
    '([0-9a-fA-F]{1,4}:){1,7}:|' + // 1::                              1:2:3:4:5:6:7::
    '([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|' + // 1::8             1:2:3:4:5:6::8  1:2:3:4:5:6::8
    '([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|' + // 1::7:8           1:2:3:4:5::7:8  1:2:3:4:5::8
    '([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|' + // 1::6:7:8         1:2:3:4::6:7:8  1:2:3:4::8
    '([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|' + // 1::5:6:7:8       1:2:3::5:6:7:8  1:2:3::8
    '([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|' + // 1::4:5:6:7:8     1:2::4:5:6:7:8  1:2::8
    '[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|' + // 1::3:4:5:6:7:8   1::3:4:5:6:7:8  1::8
    ':((:[0-9a-fA-F]{1,4}){1,7}|:)|' + // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8 ::8       ::
    'fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|' + // fe80::7:8%eth0   fe80::7:8%1     (link-local IPv6 addresses with zone index)
    '::(ffff(:0{1,4}){0,1}:){0,1}' +
    '((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}' +
    '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|' + // ::255.255.255.255   ::ffff:255.255.255.255  ::ffff:0:255.255.255.255  (IPv4-mapped IPv6 addresses and IPv4-translated addresses)
    '([0-9a-fA-F]{1,4}:){1,4}:' +
    '((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}' +
    '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])' + // 2001:db8:3:4::192.0.2.33  64:ff9b::192.0.2.33 (IPv4-Embedded IPv6 Address)
    ')\\]' +
    '|' +
    'localhost' +
    '|' +
    // host name
    '(?:xn--[a-z0-9\\-]{1,59}|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?){0,62}[a-z\\u00a1-\\uffff0-9]{1,63}))' +
    // domain name
    '(?:\\.(?:xn--[a-z0-9\\-]{1,59}|(?:[a-z\\u00a1-\\uffff0-9]+-?){0,62}[a-z\\u00a1-\\uffff0-9]{1,63}))*' +
    // TLD identifier
    '(?:\\.(?:xn--[a-z0-9\\-]{1,59}|(?:[a-z\\u00a1-\\uffff]{2,63})))' +
    ')' +
    // port number
    '(?::\\d{2,5})?' +
    // resource path
    '(?:/[^\\s]*)?' +
    '$',
  'i'
);

export const tabSetting = {
  parameters: 'parameters',
  otherSettings: 'otherSettings'
};

export const domainObj = {
  name: 'Domains',
  id: 'domain',
  view_type: 'domain',
  tab: tabSetting.parameters,
  view_settings: {
    validation: 'type_email'
  },
  values: [],
  validator: (data) => {
    return !!data.match(regexDomain);
  },
  adder: (value) => {
    return {
      value
    };
  },
  texts: {
    area_placeholder: 'Insert your domain(s) or subdomain(s)',
    tooltip: 'Invalid format',
    description:
      'Insert your company domains or subdomains (e.g. mycompany.co.uk). You can also add multiple domains and subdomains (one per line)',
    list: 'Current domains'
  }
};

export const ipObj = {
  name: 'IPs',
  id: 'ip',
  tab: tabSetting.parameters,
  view_type: 'ip',
  view_settings: {
    validation: 'type_ip'
  },
  values: [],
  validator: (data) => {
    return (
      !!data.match(
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
      ) ||
      !!data.match(
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\-(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
      ) ||
      !!data.match(
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
      )
    );
  },
  adder: (value) => {
    return {
      value
    };
  },
  texts: {
    area_placeholder: 'Insert your IPs',
    tooltip: 'Invalid format',
    description:
      'Insert your IPs (e.g. 127.0.0.1, 123.234.0.0), IP ranges (e.g. 123.123.123.123-123.123.123.189) or IP masks (e.g. 123.123.123.123/24). You can also add multiple IPs (one per line).',
    list: 'Current IPs'
  }
};

export const adVancedFiltersObj = {
  name: 'Advanced Filters',
  id: 'filters',
  view_type: 'filters_settings'
};

export const rawTermsObj = {
  name: 'Raw terms',
  id: 'terms',
  view_type: 'terms_custom'
};

export const searchWordsObj = {
  name: 'Search Words',
  id: 'keyword',
  view_type: 'keyword',
  tab: tabSetting.parameters,
  view_settings: {
    validation: 'type_keyword'
  },
  values: [],
  validator: (data) => {
    return data;
  },
  adder: (value) => {
    return {
      value
    };
  },
  texts: {
    area_placeholder: 'Insert your keyword(s)',
    tooltip: 'Invalid format',
    description:
      'List of terms related to your Organization that could be contained inside documents of your interest. It is highly recommended to avoid generic terms such as confidential, private, etc. Minimun length is 3 characters.',
    list: 'Current Search Words'
  }
};

export const hacktivismRssObj = {
  name: 'Hacktivism RSS',
  id: 'RSS',
  view_type: 'RSS',
  tab: tabSetting.parameters,
  view_settings: {
    validation: 'type_RSS'
  },
  values: [],
  validator: (data) => {
    return !!data.match(
      /^((https?|ftp):\/\/)([\w\Q$-_+!*'(),%\E]+\.)+(\w{2,63})(:\d{1,4})?([\w\Q/$-_+!*'(),%\E]+\.?[\w])*\/?$/
    );
  },
  adder: (value) => {
    return {
      title: value,
      url: value
    };
  },
  texts: {
    area_placeholder: 'Insert your hacktivism RSS',
    tooltip: 'Invalid format, RSS needs to start with https://, http:// or ftp://',
    description:
      'Insert the URL of the Hacktivist RSS that you want to follow. e.g. http://hacks.blogspot.com/feeds/posts/default',
    list: 'Hacktivism RSSs'
  }
};

export const twitterUsersObj = {
  name: 'Twitter Users',
  id: 'twitter_profile',
  view_type: 'twitter_profile',
  tab: tabSetting.parameters,
  view_settings: {
    validation: 'type_twitter_profile'
  },
  values: [],
  validator: (data) => {
    return !!data.match(/^@(\w){1,15}$/);
  },
  adder: (value) => {
    return {
      value
    };
  },
  texts: {
    area_placeholder: 'Insert your Twitter Users',
    tooltip: 'Invalid format',
    description: 'Insert the Twitter Profiles that you want to follow.',
    list: 'Twitter Users'
  }
};

export const termsObj = {
  name: 'Terms',
  id: 'terms',
  view_type: 'terms_custom'
};

export const filtersObj = {
  name: 'Filters',
  id: 'filters',
  view_type: 'filters_settings'
};

export const rssObj = {
  name: 'RSS',
  id: 'rss',
  view_type: 'rss_brand_abuse'
};
