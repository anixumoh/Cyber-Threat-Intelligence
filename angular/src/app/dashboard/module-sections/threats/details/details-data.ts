export const headerData = {
  credential: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'DOMAIN', value: 'domain' }, // I can't see in master
      { name: 'CREDENTIALS FOUND', value: 'credentialsLength' }, // I can't see in master
      { name: 'EMAILS', value: 'email', isBoolean: true },
      { name: 'EMPLOYEES', value: 'employee', isBoolean: true },
      { name: 'CUSTOMERS', value: 'customer', isBoolean: true },
      { name: 'EXTERNALS', value: 'external', isBoolean: true },
      { name: 'LABELS', value: 'labels' },
      { name: 'UPLOADED AT', value: 'uploadDate', isDate: true } // I can't see in master
    ],
    [
      { name: 'CREDENTIALS COUNT', value: 'num_cred' },
      { name: 'CREDENTIALS TYPE', value: 'resource_type' },
      { name: 'LEAK ORIGIN', value: 'leakOrigin' }, // I can't see in master
      { name: 'LEAK FOUND AT', value: 'leakFoundAt' }, // I can't see in master
      { name: 'LEAK DATE', value: 'leakDate', isDate: true }, // I can't see in master
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'CHANGED AT', value: 'changed_at', isDate: true }
    ]
  ],
  media_tracker: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'TITLE', value: 'title' },
      { name: 'SEARCH WORDS', value: 'search_words' },
      { name: 'LANGUAGE', value: 'language_id' },
      { name: 'COUNTRY', value: 'countries_id' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'STATUS', value: 'analysis_calc_result' },
      { name: 'ORIGIN', value: 'transform' }, // does not come from BE
      { name: 'TYPE', value: 'domain_type' },
      { name: 'URL', value: 'url' },
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'UPDATED AT', value: 'updated_at', isDate: true } // does not come from BE
    ]
  ],
  credit_card: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'AFFECTED BANK', value: 'title' },
      { name: 'CARDS FOUND', value: 'num_cards' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'SOURCES', value: 'sources' },
      { name: 'DATE', value: 'changed_at', isDate: true },
      { name: 'STATUS', value: 'analysis_calc_result' }
    ]
  ],
  hacktivism: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'TITLE', value: 'title' },
      { name: 'SEARCH WORDS', value: 'search_words' },
      { name: 'LANGUAGE', value: 'language_id' },
      { name: 'COUNTRY', value: 'countries_id' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'STATUS', value: 'analysis_calc_result' },
      { name: 'ORIGIN', value: 'transform' },
      { name: 'TYPE', value: 'domain_type' }, // does not come from BE
      { name: 'URL', value: 'url' },
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'UPDATED AT', value: 'updated_at', isDate: true } // does not come from BE
    ]
  ],
  domain_protection: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'TITLE', value: 'title' },
      { name: 'URL', value: 'url' },
      { name: 'LANGUAGE', value: 'language_id' },
      { name: 'COUNTRY', value: 'countries_id' },
      { name: 'ORIGIN', value: 'transform' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'STATUS', value: 'analysis_calc_result' },
      { name: 'SEARCH WORDS', value: 'search_words' },
      { name: 'CONTENT TYPE', value: 'content_type' },
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'UPDATED AT', value: 'changed_at', isDate: true }
    ]
  ],
  data_leakage: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'TITLE', value: 'title' },
      { name: 'URL', value: 'url' },
      { name: 'COUNTRY', value: 'countries_id' },
      { name: 'LANGUAGE', value: 'language_id' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'STATUS', value: 'analysis_calc_result' },
      { name: 'ORIGIN', value: 'transform' },
      { name: 'SEARCH WORDS', value: 'search_words' },
      { name: 'CONTENT TYPE', value: 'content_type' },
      { name: 'DOMAIN TYPE', value: 'domain_type' },
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'UPDATED AT', value: 'changed_at', isDate: true }
    ]
  ],
  dark_web: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'URL', value: 'url' },
      { name: 'COUNTRY', value: 'countries_id' },
      { name: 'LANGUAGE', value: 'language_id' },
      { name: 'LABELS', value: 'labels' },
      { name: 'STATUS', value: 'analysis_calc_result' },
      { name: 'ORIGIN', value: 'transform' }
    ],
    [
      { name: 'SEARCH WORDS', value: 'search_words' },
      { name: 'CONTENT TYPE', value: 'content_type' },
      { name: 'DOMAIN TYPE', value: 'domain_type' },
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'UPDATED AT', value: 'changed_at', isDate: true }
    ]
  ],
  social_media: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'TITLE', value: 'title' },
      { name: 'URL', value: 'url' },
      { name: 'FILE', value: 'file' },
      { name: 'LANGUAGE', value: 'language_id' },
      { name: 'COUNTRY', value: 'countries_id' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'STATUS', value: 'analysis_calc_result' },
      { name: 'SEARCH WORDS', value: 'search_words' },
      { name: 'ORIGIN', value: 'transform' },
      { name: 'TYPE', value: 'domain_type' },
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'UPDATED AT', value: 'changed_at', isDate: true }
    ]
  ],
  custom: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'TITLE', value: 'title' },
      { name: 'URL', value: 'url' },
      { name: 'FILE', value: 'file' },
      { name: 'COUNTRY', value: 'countries_id' },
      { name: 'LANGUAGE', value: 'language_id' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'STATUS', value: 'analysis_calc_result' },
      { name: 'ORIGIN', value: 'transform' },
      { name: 'SEARCH WORDS', value: 'search_words' },
      { name: 'CONTENT TYPE', value: 'content_type' },
      { name: 'DOMAIN TYPE', value: 'domain_type' },
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'UPDATED AT', value: 'changed_at', isDate: true }
    ]
  ],
  malware: [
    [
      { name: 'SUBMITTED', value: 'submitted' }, // does not come from BE
      { name: 'FILE TYPE', value: 'fileType' },
      { name: 'ARCHITECTURE', value: 'architecture' },
      { name: 'SIZE', value: 'size' },
      { name: 'MALWARE', value: 'malware' },
      { name: 'SEVERITY', value: 'severity' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'MD5', value: 'md5' },
      { name: 'SHA1', value: 'sha1' },
      { name: 'SHA256', value: 'sha256' },
      { name: 'SSDEEP', value: 'ssdeep' },
      { name: 'SEARCH WORDS', value: 'search_words' }
    ]
  ],
  mobile_apps: [
    [
      { name: 'RATING', value: 'user_rating' },
      { name: 'TITLE', value: 'title' },
      { name: 'URL', value: 'url' },
      { name: 'FILE', value: 'file' }, // does not come from BE
      { name: 'COUNTRY', value: 'countries_id' },
      { name: 'LANGUAGE', value: 'language_id' },
      { name: 'LABELS', value: 'labels' }
    ],
    [
      { name: 'STATUS', value: 'analysis_calc_result' },
      { name: 'ORIGIN', value: 'transform' },
      { name: 'SEARCH WORDS', value: 'search_words' },
      { name: 'CONTENT TYPE', value: 'content_type' },
      { name: 'DOMAIN TYPE', value: 'domain_type' },
      { name: 'CREATED AT', value: 'created_at', isDate: true },
      { name: 'CHECKED AT', value: 'checked_at', isDate: true },
      { name: 'UPDATED AT', value: 'changed_at', isDate: true }
    ]
  ]
};
