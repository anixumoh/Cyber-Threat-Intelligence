import { emailRegexp } from '$lib/utils/regexPatterns';
import {
  domainRegex,
  regexArabic,
  regexChinese,
  regexCyrilic,
  regexGreek,
  regexJapanese,
  regexKorean,
  regexSearchWord
} from '$lib/utils/regexPatterns';
import * as yup from 'yup';

export const SETTINGS_DICTIONARY = {
  DOMAIN: 'Domains',
  IP: 'IPs',
  EMAIL: 'E-mails',
  KEYWORD: 'Terms',
  FILENAME: 'Filenames',
  CONFIDENTIAL: 'Confidential',
  FILE_EXTENSION: 'File Extension',
  TYPOSQUATTING: 'Typosquatting Keywords',
  TYPO_KEYWORD_REGEX: 'Typosquatting by similarity',
  TYPO_KEYWORD_DISTANCE: 'Typosquatting by Distance',
  BANK: 'Banks',
  CREDIT_CARD: 'Credit Cards',
  CPE_TECH: 'Platforms & Technologies',
  RSS: 'RSS',
  TWITTER_PROFILE: 'Twitter Profiles',
  EXTRA_CATEGORIES: 'Extra Categories',
  MARKETPLACES: 'Marketplaces',
  IMAGE: 'Images',
  TWEETS_FROM_PROFILE: 'Twitter Users'
};

export const MODULES_TYPES_DICTIONARY = {
  CUSTOM: 'Custom',
  DOMAIN_PROTECTION: 'Domain Protection',
  CREDIT_CARDS_FULL: 'Credit Cards',
  MOBILE_APPS: 'Mobile Apps',
  MALWARE: 'Malware',
  CREDENTIALS: 'Credentials',
  DATA_LEAKAGE: 'Data Leakage',
  SOCIAL_MEDIA: 'Social Media',
  HACKTIVISM: 'Hacktivism',
  MEDIA_TRACKER: 'Media Tracker',
  DARK_WEB: 'Dark Web',
  THREAT_CONTEXT: 'Threat Context',
  EXPLORER: 'Explorer'
};

export const SETTINGS_PER_MODULE = {
  DOMAIN: ['CREDENTIALS', 'DARK_WEB', 'DOMAIN_PROTECTION', 'MALWARE', 'HACKTIVISM', 'DATA_LEAKAGE'],
  IP: ['CREDENTIALS', 'MALWARE', 'HACKTIVISM', 'DARK_WEB'],
  EMAIL: ['CREDENTIALS'],
  KEYWORD: [
    'DATA_LEAKAGE',
    'DOMAIN_PROTECTION',
    'HACKTIVISM',
    'MEDIA_TRACKER',
    'DARK_WEB',
    'MOBILE_APPS',
    'SOCIAL_MEDIA'
  ],
  FILENAME: ['DATA_LEAKAGE'],
  CONFIDENTIAL: ['DATA_LEAKAGE'],
  FILE_EXTENSION: ['DATA_LEAKAGE'],
  TYPOSQUATTING: ['DOMAIN_PROTECTION'],
  TYPO_KEYWORD_REGEX: ['DOMAIN_PROTECTION'],
  TYPO_KEYWORD_DISTANCE: ['DOMAIN_PROTECTION'],
  BANK: ['CREDIT_CARDS_FULL'],
  CREDIT_CARD: ['CREDIT_CARDS_FULL'],
  CPE_TECH: ['HACKTIVISM'],
  RSS: ['HACKTIVISM', 'MEDIA_TRACKER'],
  TWITTER_PROFILE: ['HACKTIVISM'],
  EXTRA_CATEGORIES: ['MEDIA_TRACKER'],
  IMAGE: ['SOCIAL_MEDIA'],
  TWEETS_FROM_PROFILE: ['MEDIA_TRACKER']
};

export const PRIORITY_TYPES = ['DOMAIN', 'KEYWORD', 'IP', 'BANK'];
export const PRIORITY_TYPES_SORT = {
  DOMAIN: 1,
  KEYWORD: 2,
  IP: 3,
  BANK: 4
};

export const CHECK = [
  'KEYWORD',
  'DOMAIN',
  'EMAIL',
  'IP',
  'CREDIT_CARD',
  'RSS',
  'TWITTER_PROFILE',
  'TYPOSQUATTING',
  'TYPO_KEYWORD_REGEX',
  'TYPO_KEYWORD_DISTANCE',
  'CONFIDENTIAL',
  'FILENAME',
  'TWEETS_FROM_PROFILE'
];

const domainInfo =
  'Insert your company domains or subdomains (e.g. mycompany.co.uk). You can also add multiple domains and subdomains (one per line)';
const ipInfo =
  'Insert your IPs (e.g. 127.0.0.1, 123.234.0.0), IP ranges (e.g. 123.123.123.123-123.123.123.189) or IP masks (e.g. 123.123.123.123/24). You can also add multiple IPs (one per line).';
const emailInfo = 'Insert your emails (e.g. bar@fo.oo, foo@b.ar). You can also add multiple emails (one per line).';
const rssInfo =
  'Insert the URL of the RSS that you want to follow. e.g. http://hacks.blogspot.com/feeds/posts/default. You can also add multiple URL (one per line).';
const bankInfo =
  'Insert bank names as Keywords to search using `Search` input. Select the banks to recover compromised credit cards';
const typosquattingInfo =
  'List of keywords that can be found inside domain name trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces';
const typoKeywordDistanceInfo = `${typosquattingInfo} e.g.: example~2 would retrieve: esemple, ecanple, eexamplee,...`;

export const MIN_LENGTH_3 = 'Please, make sure they are minimum 3 characters long.';

const stringLength3 = yup.string().min(3, MIN_LENGTH_3);
const emailValidation = yup.string().test('is-email', emailInfo, (data) => {
  const split = data.trim().split('\n');
  let finalValue = true;
  for (let i = 0; i < split.length; i++) {
    if (!split[i].match(emailRegexp)) {
      finalValue = false;
      break;
    }
  }

  return finalValue;
});
const typosquattingValidation = (msg: string) =>
  yup.string().test('is-typosquatting', msg, (data) => {
    const split = data.trim().split('\n');
    let finalValue = true;
    for (let i = 0; i < split.length; i++) {
      if (split[i].toLowerCase().match(' ')) {
        finalValue = false;
        break;
      }
    }

    return finalValue;
  });

export const SETTINGS = {
  DOMAIN: {
    placeholder: 'Domain(s)',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: domainInfo,
    validation: yup.string().test('is-domain', domainInfo, (domains) => {
      const split = domains.trim().split('\n');
      let finalValue = true;
      for (let i = 0; i < split.length; i++) {
        if (!split[i].match(domainRegex)) {
          finalValue = false;
          break;
        }
      }

      return finalValue;
    })
  },
  IP: {
    placeholder: 'IPs',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: ipInfo,
    validation: yup.string().test('validate-ip', ipInfo, (data) => {
      const split = data.trim().split('\n');
      let finalValue = true;
      for (let i = 0; i < split.length; i++) {
        if (
          !split[i].match(
            /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
          ) &&
          !split[i].match(
            /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\-(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
          ) &&
          !split[i].match(
            /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
          )
        ) {
          finalValue = false;
          break;
        }
      }

      return finalValue;
    })
  },
  KEYWORD: {
    placeholder: 'Keyword(s)',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: 'List of terms related to your organization',
    validation: stringLength3.test('is-term', 'Invalid format', (data, ctx) => {
      if (data?.match(' ')) {
        return ctx.createError({
          message:
            'Configured keywords in Domain Protection modules cannot contain spaces. Please remove them or configure these modules separately.'
        });
      }
      const split = data.trim().split('\n');
      for (let i = 0; i < split.length; i++) {
        if (
          !split[i].match(regexSearchWord) &&
          !split[i].match(regexArabic) &&
          !split[i].match(regexJapanese) &&
          !split[i].match(regexChinese) &&
          !split[i].match(regexKorean) &&
          !split[i].match(regexCyrilic) &&
          !split[i].match(regexGreek)
        ) {
          return ctx.createError({ message: 'Please make sure the terms do not contain any invalid characters.' });
        } else if (split[i].length < 3) {
          return ctx.createError({ message: MIN_LENGTH_3 });
        }
      }
      return true;
    })
  },
  EMAIL: {
    placeholder: 'Emails',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: emailInfo,
    validation: emailValidation
  },
  USERNAME: {
    placeholder: 'Emails',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: emailInfo,
    validation: emailValidation
  },
  RSS: {
    placeholder: 'URL of the RSS',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: rssInfo,
    validation: yup.string().test('is-rss', rssInfo, (data) => {
      const split = data.trim().split('\n');
      let finalValue = true;
      for (let i = 0; i < split.length; i++) {
        if (!split[i].toLowerCase().match(/^((http|https|ftp):\/\/)/)) {
          finalValue = false;
          break;
        }
      }

      return finalValue;
    })
  },
  CONFIDENTIAL: {
    placeholder: 'Filter(s)',
    placeholderAdd: 'Write your settings here separated by a line break',
    description:
      'List of terms that are contained into a document and allows classifying it as Confidential e.g. restricted document e.g. confidential document',
    validation: yup.string()
  },
  TWEETS_FROM_PROFILE: {
    placeholder: 'Twitter Users',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: 'Insert the Twitter Profiles that you want to follow.',
    validation: yup.string()
  },
  EXTRA_CATEGORIES: {
    placeholder: 'Category',
    description: 'Insert the RSS Category that you want to follow.',
    validation: yup.string()
  },
  FILE_EXTENSION: {
    placeholder: 'Extensions',
    description: 'Hover over each type to see a list of extensions that will be filtered.',
    validation: yup.string()
  },
  BANK: {
    placeholder: 'Search Bank',
    placeholderAdd: 'Write the bank`s name here',
    placeholderAddBincode: 'Write your bincodes separated by comma',
    description: bankInfo,
    validationBincode: yup
      .string()
      .required('This field is mandatory.')
      .test('is-bincode', 'Bincodes must be 6 or 8 digits lenght', (bincodes) => {
        const splitBincodes = bincodes.split(',');
        let finalValue = true;
        for (let i = 0; i < splitBincodes.length; i++) {
          if (!splitBincodes[i].match(/^(\d{6}|\d{8})$/)) {
            finalValue = false;
            break;
          }
        }
        return finalValue;
      }),
    validation: yup
      .string()
      .test(
        'bank-regex',
        'Please, make sure they are minimum 2 characters long. Bank name can only contain letters.',
        (data) => {
          return !!data.toLowerCase().match(/^[a-zA-Z ]{2,63}$/);
        }
      )
  },
  CREDIT_CARD: {
    placeholder: 'md5/touy',
    placeholderAdd: 'Write your settings here separated by a line break',
    description:
      // tslint:disable-next-line: quotemark
      "Please, insert your credit card md5 hash or your credit card number. Once you've entered your credit card number, its hash will be calculated. We will not send nor store your credit card number",
    validation: yup.string().test('is-credit-card', 'Invalid credit cards', (data) => {
      const split = data.trim().split('\n');
      let finalValue = true;
      for (let i = 0; i < split.length; i++) {
        if (!split[i].match(/^([a-f0-9]{32})|([0-9]{12,19})$/gm)) {
          finalValue = false;
          break;
        }
      }

      return finalValue;
    })
  },
  FILENAME: {
    placeholder: 'File Name(s)',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: 'Names or parts of a file name e.g. blueliv_confidential.docx e.g. security_report_blueliv.pdf',
    validation: yup.string()
  },
  IMAGE: {
    placeholder: 'Image name',
    placeholderAdd: 'Write your search phrase here',
    description: 'To be done',
    validation: yup.string().required('This field is mandatory.')
  },
  TYPOSQUATTING: {
    placeholder: 'Keywords',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: typosquattingInfo,
    validation: typosquattingValidation(typosquattingInfo)
  },
  TWITTER_PROFILE: {
    placeholder: 'Twitter Users',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: 'Insert the Twitter Profiles that you want to follow.',
    validation: yup.string()
  },
  CPE_TECH: {
    placeholder: 'Platform/Tech',
    placeholderAdd: 'Search for vendor',
    description:
      'Look for new vulnerabilities in a specialized set of sources for the selected platforms and technologies. The search will be transformed into a valid CPE based on Nist Data Base.',
    validation: yup.string()
  },
  TYPO_KEYWORD_REGEX: {
    placeholder: 'Keywords',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: typosquattingInfo,
    validation: typosquattingValidation(typosquattingInfo)
  },
  TYPO_KEYWORD_DISTANCE: {
    placeholder: 'Keywords',
    placeholderAdd: 'Write your settings here separated by a line break',
    description: typoKeywordDistanceInfo,
    validation: typosquattingValidation(typoKeywordDistanceInfo)
  }
};

export const ASSETS_LISTS = {
  FILE_EXTENSION: [
    {
      value: 'Documents',
      id: 'doc',
      formats: 'doc, docx, odt, pages, rtf, tex, txt, wpd, wps, ps, eps, pdf, xlr, xls, xlsx, ppt, pptx, pps, odp'
    },
    {
      value: 'Data Files',
      id: 'data',
      formats: 'csv, dat, gbr, ged, ibooks, key, keychain, sdf, tar, tax2012, vcf, xml, log, msg, pst, json'
    },
    { value: 'Audio', id: 'audio', formats: 'aif, iff, m3u, m4a, mid, mp3, mpa, ra, wav, wma' },
    { value: 'Video', id: 'video', formats: '3g2, 3gp, asf, asx, avi, flv, mov, mp4, mpg, rm, srt, swf, vob, wmv' },
    {
      value: 'Image',
      id: 'image',
      formats: '3dm, 3ds, max, obj, bmp, dds, gif, jpg, jpeg, png, psd, pspimage, tga, thm, tif, tiff, yuv, svg'
    },
    { value: 'Compressed', id: 'zip', formats: '7z, cbr, deb, gz, pkg, rar, rpm, sitx, targz, zip, zipx' },
    { value: 'Disk Image', id: 'disk', formats: 'bin, cue, dmg, iso, mdf, toast, vcd' },
    {
      value: 'Code',
      id: 'code',
      formats:
        'js, cs, php, html, htm, md, css, py, po, jsp, jsx, aspx, swift, strings, cpp, ts, pot, graphql, java, class, c, cgi, pl, h, vb'
    },
    { value: 'Other', id: 'other', formats: 'Any extension not included previously' }
  ],
  EXTRA_CATEGORIES: [
    { id: 'ECONOMIC_PRESS', value: 'Economic press' },
    { id: 'SECURITY_COMPANIES', value: 'Security companies' },
    { id: 'SELF_REGULATORY_ORGANIZATION', value: 'Self regulatory organization' },
    { id: 'OFFICIAL_ORGANIZATION', value: 'Official organization' },
    { id: 'THINK_TANK', value: 'Think tank' },
    { id: 'BANKING_THINK_TANK', value: 'Banking think tank' }
  ],
  FORMATS: {
    doc: {
      value: 'Documents',
      formats: 'doc, docx, odt, pages, rtf, tex, txt, wpd, wps, ps, eps, pdf, xlr, xls, xlsx, ppt, pptx, pps, odp'
    },
    data: {
      value: 'Data Files',
      formats: 'csv, dat, gbr, ged, ibooks, key, keychain, sdf, tar, tax2012, vcf, xml, log, msg, pst, json'
    },
    audio: { value: 'Audio', formats: 'aif, iff, m3u, m4a, mid, mp3, mpa, ra, wav, wma' },
    video: { value: 'Video', formats: '3g2, 3gp, asf, asx, avi, flv, mov, mp4, mpg, rm, srt, swf, vob, wmv' },
    image: {
      value: 'Image',
      formats: '3dm, 3ds, max, obj, bmp, dds, gif, jpg, jpeg, png, psd, pspimage, tga, thm, tif, tiff, yuv, svg'
    },
    zip: { value: 'Compressed', formats: '7z, cbr, deb, gz, pkg, rar, rpm, sitx, targz, zip, zipx' },
    disk: { value: 'Disk Image', formats: 'bin, cue, dmg, iso, mdf, toast, vcd' },
    other: { value: 'Other', formats: 'Any extension not included previously' },
    code: {
      value: 'Code',
      formats:
        'js, cs, php, html, htm, md, css, py, po, jsp, jsx, aspx, swift, strings, cpp, ts, pot, graphql, java, class, c, cgi, pl, h, vb'
    }
  }
};
