import {
  domainRegex,
  regexArabic,
  regexChinese,
  regexCyrilic,
  regexEmail,
  regexGreek,
  regexJapanese,
  regexKorean,
  regexSearchWord
} from 'app/utils/regexps';

export const SETTINGS = {
  DOMAIN: {
    description:
      'Insert your company domains or subdomains (e.g. mycompany.co.uk). You can also add multiple domains and subdomains (one per line)',
    validator: (data) => {
      if (!data.match(domainRegex)) {
        return 'Invalid format';
      }
    }
  },
  IP: {
    description:
      'Insert your IPs (e.g. 127.0.0.1, 123.234.0.0), IP ranges (e.g. 123.123.123.123-123.123.123.189) or IP masks (e.g. 123.123.123.123/24). You can also add multiple IPs (one per line).',
    validator: (data) => {
      if (
        data &&
        !data.match(
          /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
        ) &&
        !data.match(
          /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\-(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
        ) &&
        !data.match(
          /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
        )
      ) {
        return 'Invalid ip';
      }
    }
  },
  KEYWORD: {
    description: 'List of terms related to your organization',
    validator: (data, isPhishing) => {
      if (data && data.match(' ') && isPhishing) {
        return 'Configured keywords in Domain Protection modules cannot contain spaces. Please remove them or configure these modules separately.';
      } else if (
        data &&
        !data.match(regexSearchWord) &&
        !data.match(regexArabic) &&
        !data.match(regexJapanese) &&
        !data.match(regexChinese) &&
        !data.match(regexKorean) &&
        !data.match(regexCyrilic) &&
        !data.match(regexGreek)
      ) {
        return 'Please make sure the terms do not contain any invalid characters.';
      } else if (data && data.length < 3) {
        return 'Minimum length is 3 characters';
      }
    }
  },
  EMAIL: {
    description: 'Insert your emails (e.g. bar@fo.oo, foo@b.ar).',
    validator: (data) => {
      if (data && !data.match(regexEmail)) {
        return 'Invalid e-mail';
      }
    }
  },
  USERNAME: {
    description: 'Insert your emails (e.g. bar@fo.oo, foo@b.ar).',
    validator: (data) => {
      if (data && !data.match(regexEmail)) {
        return 'Invalid e-mail';
      }
    }
  },
  RSS: {
    description:
      'Insert the URL of the RSS that you want to follow. e.g. http://hacks.blogspot.com/feeds/posts/default',
    validator: (data) => {
      if (data && !data.match(/^((http|https|ftp):\/\/)/)) {
        return 'Invalid RSS url';
      }
    }
  },
  CONFIDENTIAL: {
    description:
      'List of terms that are contained into a document and allows classifying it as Confidential e.g. restricted document e.g. confidential document',
    validator: (data) => {
      return;
    }
  },
  TWEETS_FROM_PROFILE: {
    description: 'Insert the Twitter Profiles that you want to follow.',
    validator: (data) => {
      return;
    }
  },
  EXTRA_CATEGORIES: {
    description: 'Insert the RSS Category that you want to follow.',
    validator: (data) => {
      return;
    }
  },
  FILE_EXTENSION: {
    description: 'Hover over each type to see a list of extensions that will be filtered.',
    validator: (data) => {
      return;
    }
  },
  BANK: {
    description:
      // tslint:disable-next-line: quotemark
      "Insert bank names as Keywords to search using 'Search' input. Select the banks to recover compromised credit cards",
    validator: (data) => {
      if (data && !data.match(/^[a-zA-Z ]{2,63}$/)) {
        return 'Invalid bank name';
      }
    }
  },
  CREDIT_CARD: {
    description:
      // tslint:disable-next-line: quotemark
      "Please, insert your credit card md5 hash or your credit card number. Once you've entered your credit card number, its hash will be calculated. We will not send nor store your credit card number",
    validator: (data) => {
      if (data && !data.match(/^([a-f0-9]{32})|([0-9]{12,19})$/gm)) {
        return 'Invalid credit card';
      }
    }
  },
  FILENAME: {
    description: 'Names or parts of a file name e.g. blueliv_confidential.docx e.g. security_report_blueliv.pdf',
    validator: (data) => {
      return;
    }
  },
  IMAGE: {
    description: 'To be done',
    validator: (data) => {
      return;
    }
  },
  TYPOSQUATTING: {
    description:
      'List of keywords that can be found inside domain name trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces',
    validator: (data) => {
      if (data && data.match(' ')) {
        return 'Cannot contain spaces';
      } else {
        return;
      }
    }
  },
  TWITTER_PROFILE: {
    description: 'Insert the Twitter Profiles that you want to follow.',
    validator: (data) => {
      return;
    }
  },
  CPE_TECH: {
    description:
      'Look for new vulnerabilities in a specialized set of sources for the selected platforms and technologies. The search will be transformed into a valid CPE based on Nist Data Base.',
    validator: (data) => {
      return;
    }
  },
  TYPO_KEYWORD_REGEX: {
    description:
      'List of keywords that will be used to find similar domain names trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces.',
    validator: (data) => {
      if (data && data.match(' ')) {
        return 'Cannot contain spaces';
      } else {
        return;
      }
    }
  },
  TYPO_KEYWORD_DISTANCE: {
    description:
      'List of keywords that will be used to find domain names at a configurable distance trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces. e.g.: example~2 would retrieve: esemple, ecanple, eexamplee,...',
    validator: (data) => {
      if (data && data.match(' ')) {
        return 'Cannot contain spaces';
      } else {
        return;
      }
    }
  }
};
