import { emailRegexp, regexSpace, regexUrlSpaces, regexWithOutQuotes } from './regexPatterns';

export const tabSetting = {
  parameters: 'parameters',
  otherSettings: 'otherSettings'
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

// export settigns
export const settings = {
  credential: [
    domainObj,
    ipObj,
    {
      name: 'Emails',
      id: 'email',
      view_type: 'email',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_email'
      },
      values: [],
      validator: (data) => {
        return !!data.match(emailRegexp);
      },
      adder: (value) => {
        return {
          value
        };
      },
      texts: {
        area_placeholder: 'Insert your emails',
        tooltip: 'Invalid format',
        description: 'Insert your emails (e.g. bar@fo.oo, foo@b.ar). You can also add multiple emails (one per line).',
        list: 'Current email'
      }
    },
    adVancedFiltersObj,
    rawTermsObj,
    {
      name: 'Classify',
      id: 'classification',
      view_type: 'classification'
    }
  ],
  data_leakage: [
    searchWordsObj,
    domainObj,
    {
      name: 'File Names',
      id: 'filename',
      view_type: 'filename',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_filename'
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
        area_placeholder: 'Insert your File Name(s)',
        tooltip: 'Invalid format',
        description: 'Names or parts of a file name e.g. blueliv_confidential.docx e.g. security_report_blueliv.pdf',
        list: 'Current filename'
      }
    },
    {
      name: 'Confidential Filters',
      id: 'confidential',
      view_type: 'confidential',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_confidential'
      },
      values: [],
      validator: (data) => {
        return !!data.match(/(.){2,63}/);
      },
      adder: (value) => {
        return {
          value
        };
      },
      texts: {
        area_placeholder: 'Insert your filter(s)',
        tooltip: 'Invalid format',
        description:
          'List of terms that are contained into a document and allows classifying it as Confidential e.g. restricted document e.g. confidential document',
        list: 'Current filters'
      }
    },
    {
      name: 'File Extension',
      id: 'file_extension',
      view_type: 'file_extension',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_file_extension'
      },
      values: [],
      validator: (data) => {
        return data;
      },
      adder: (value) => {
        return { value };
      },
      texts: {
        description: 'Hover over each type to see a list of extensions that will be filtered.'
      }
    },
    adVancedFiltersObj,
    rawTermsObj
  ],
  domain_protection: [
    domainObj,
    {
      name: 'Terms',
      id: 'keyword',
      view_type: 'keyword',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_terms'
      },
      values: [],
      validator: (data) => {
        return !!data.match(regexSpace);
      },
      adder: (value) => {
        return {
          value
        };
      },
      texts: {
        area_placeholder: 'Insert your search terms',
        tooltip: 'Invalid format. Check that the terms do not contain spaces.',
        description:
          'List of terms related to your organization that could be affected by phishing attacks like company name, product name, etc. No spaces allowed.',
        list: 'Search Terms'
      }
    },
    {
      name: 'Typosquatting Keywords',
      id: 'typosquatting',
      view_type: 'typosquatting',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_typosquatting'
      },
      values: [],
      validator: (data) => {
        return !!data.match(regexSpace);
      },
      adder: (value) => {
        return {
          value
        };
      },
      texts: {
        area_placeholder: 'Insert your typosquatting keyword',
        tooltip: 'Invalid format',
        description:
          'List of keywords that can be found inside domain name trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces.',
        list: 'Typosquatting Keywords'
      }
    },
    {
      name: 'Typosquatting by Similarity',
      id: 'typo_keyword_regex',
      view_type: 'typo_keyword_regex',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_typo_keyword_regex'
      },
      values: [],
      validator: (data) => {
        return !!data.match(regexWithOutQuotes) && !!data.match(regexUrlSpaces);
      },
      adder: (value) => {
        return {
          value
        };
      },
      texts: {
        area_placeholder: 'Insert your typosquatting keyword',
        tooltip: 'Invalid format',
        description:
          'List of keywords that will be used to find similar domain names trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces.',
        list: 'Typosquatting by Similarity'
      }
    },
    {
      name: 'Typosquatting by Distance',
      id: 'typo_keyword_distance',
      view_type: 'typo_keyword_distance',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_typo_keyword_distance'
      },
      values: [],
      validator: (data) => {
        return !!data.match(regexSpace);
      },
      adder: (value) => {
        return {
          value
        };
      },
      texts: {
        area_placeholder: 'Insert your typosquatting keyword',
        tooltip: 'Invalid format',
        description:
          'List of keywords that will be used to find domain names at a configurable distance trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces. e.g.: example~2 would retrieve: esemple, ecanple, eexamplee,...',
        list: 'Typosquatting by Distance'
      }
    },
    adVancedFiltersObj,
    rawTermsObj
  ],
  malware: [domainObj, ipObj, adVancedFiltersObj],
  credit_card: [
    {
      name: 'Banks',
      id: 'bank',
      view_type: 'bank',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_bank'
      },
      values: [],
      validator: (data) => {
        return !!data.match(/^[a-zA-Z]{2,63}$/);
      },
      adder: (value) => {
        return {
          value
        };
      },
      texts: {
        area_placeholder: 'Add Bank',
        tooltip: 'Invalid format',
        description:
          "Insert bank names as Keywords to search using 'Search' input. Select the banks to recover compromised credit cards",
        list: 'Search Banks'
      }
    },
    {
      name: 'Credit Card',
      id: 'credit_card',
      view_type: 'credit_card',
      tab: tabSetting.parameters,
      view_settings: {
        validation: 'type_credit_card'
      },
      values: [],
      validator: (data) => {
        return !!data.match(/^([a-f0-9]{32})|([0-9]{12,19})$/gm);
      },
      adder: (value) => {
        return {
          value
        };
      },
      texts: {
        area_placeholder: 'Insert your credit card md5 or your credit card number',
        tooltip: 'Invalid format',
        description:
          "Please, insert your credit card md5 hash or your credit card number. Once you've entered your credit card number, its hash will be calculated. We will not send nor store your credit card number",
        list: 'Current Corporates'
      }
    },
    adVancedFiltersObj,
    rawTermsObj
  ],
  hacktivism: [
    domainObj,
    ipObj,
    searchWordsObj,
    {
      name: 'Platforms & Technologies',
      tab: tabSetting.parameters,
      id: 'tech_product',
      view_type: 'tech_product',
      view_settings: {
        validation: 'type_tech_product'
      },
      values: [],
      validator: (data) => {
        return data;
      },
      adder: (value) => {
        return { value };
      },
      texts: {
        list: 'Platforms & Technologies',
        area_placeholder: 'Platforms & Technologies',
        tooltip: 'Invalid format',
        description:
          'Look for new vulnerabilities in a specialized set of sources for the selected platforms and technologies. The search will be transformed into a valid CPE based on Nist Data Base.'
      }
    },
    hacktivismRssObj,
    twitterUsersObj,
    adVancedFiltersObj,
    rawTermsObj
  ],
  media_tracker: [
    searchWordsObj,
    hacktivismRssObj,
    {
      ...twitterUsersObj,
      id: 'tweets_from_profile'
    },
    {
      name: 'Rss Categories',
      tab: tabSetting.parameters,
      id: 'extra_categories',
      view_type: 'extra_categories',
      view_settings: {
        validation: 'type_extra_categories'
      },
      values: [],
      validator: (data) => {
        return data;
      },
      adder: (value) => ({ name: value, value: false }),
      texts: {
        area_placeholder: 'Insert new RSS Category',
        tooltip: 'Invalid format',
        description: 'Insert the RSS Category that you want to follow.',
        list: 'Rss Categories'
      }
    },
    adVancedFiltersObj,
    rawTermsObj
  ],
  dark_web: [domainObj, ipObj, searchWordsObj, adVancedFiltersObj, rawTermsObj],
  social_media: [
    {
      ...termsObj,
      view_type: 'terms_brand_abuse'
    },
    filtersObj,
    rssObj
  ],
  custom: [termsObj, filtersObj, rssObj],
  mobile_apps: [
    {
      ...searchWordsObj,
      description:
        'List of commonly known terms used in names and descriptions of mobile applications in the organization'
    },
    {
      name: 'Marketplaces',
      id: 'marketplace',
      view_type: 'marketplaces',
      tab: tabSetting.parameters,
      texts: {
        description:
          'Select the marketplaces where you want to search mobile apps.\n' +
          '      Official Markets includes: Google Play, Apple Store, Windows Phone, Blackberry World, Amazon Apps, Samsung Apps, etc.\n' +
          '      Alternative Markets includes: BlackMarkt, Aptoide, podnova, etc.'
      }
    },
    adVancedFiltersObj,
    rawTermsObj
  ],
  explorer: [
    adVancedFiltersObj,
    termsObj,
    {
      name: 'Platforms & Technologies',
      tab: tabSetting.parameters,
      id: 'tech_product',
      view_type: 'tech_product',
      view_settings: {
        validation: 'type_tech_product'
      },
      values: [],
      validator: (data) => {
        return data;
      },
      adder: (value) => {
        return { value };
      },
      texts: {
        list: 'Platforms & Technologies',
        area_placeholder: 'Platforms & Technologies',
        tooltip: 'Invalid format',
        description:
          'Look for new vulnerabilities in a specialized set of sources for the selected platforms and technologies. The search will be transformed into a valid CPE based on Nist Data Base.'
      }
    }
  ]
};
