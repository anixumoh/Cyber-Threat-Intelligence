import type { ComponentProps, SvelteComponent } from 'svelte';
import * as yup from 'yup';
import GenericParameter from './types/GenericParameter.svelte';
import Bank from './types/Bank.svelte';
import FileExtensionFilter from './types/FileExtensionFilter.svelte';
import TyposquattingDistance from './types/TyposquattingDistance.svelte';
import PlatformTechnologies from './types/PlatformTechnologies.svelte';
import RssCategories from './types/RssCategories.svelte';
import Marketplace from './types/Marketplace.svelte';
import Industry from './types/Industry.svelte';
import Company from './types/Company.svelte';
import Region from './types/Region.svelte';
import { emailRegexp, regexSpace, regexUrlSpaces, regexWithOutQuotes } from '$lib/utils/regexPatterns';
import { regexDomain } from '$lib/utils/settings';
import { MIN_LENGTH_3, MIN_LENGTH_4 } from './messages';
import { MD5 } from '$lib/utils/generateMD5';

interface ClassOf<T> extends Function {
  new (...args: any[]): T;
}

type ParameterType<T extends SvelteComponent> = {
  component: ClassOf<T>;
  props: ComponentProps<T>;
  colSpan?: number;
};

const stringLength3 = yup.string().min(3, MIN_LENGTH_3);
const stringLength4 = yup.string().min(4, MIN_LENGTH_4);

const domainInfo =
  'Insert your company domains or subdomains (e.g. mycompany.co.uk). You can also add multiple domains and subdomains (one per line)';
const DOMAIN: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'domain',
    info: domainInfo,
    noItemsMessage: 'There are no Domains',
    placeholder: 'Insert your domain(s) or subdomain(s)',
    title: 'DOMAINS',
    validation: stringLength3.test('domain-regex', domainInfo, (data) => {
      return !!data.toLowerCase().match(regexDomain);
    })
  }
};

const ipInfo =
  'Insert your IPs (e.g. 127.0.0.1, 123.234.0.0), IP ranges (e.g. 123.123.123.123-123.123.123.189) or IP masks (e.g. 123.123.123.123/24). You can also add multiple IPs (one per line).';
const IP: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'ip',
    info: ipInfo,
    noItemsMessage: 'There are no IPs',
    placeholder: 'Insert your IPs',
    title: 'IPs',
    validation: yup
      .string()
      .test(
        'validate-ip',
        ipInfo,
        (data) =>
          !!data.match(
            /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
          ) ||
          !!data.match(
            /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\-(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
          ) ||
          !!data.match(
            /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
          )
      )
  }
};

const emailInfo = 'Insert your emails (e.g. bar@fo.oo, foo@b.ar). You can also add multiple emails (one per line).';
const EMAIL: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'email',
    info: emailInfo,
    noItemsMessage: 'There are no Emails',
    placeholder: 'Insert your emails',
    title: 'EMAILS',
    validation: stringLength3.test('email-regex', emailInfo, (data) => {
      return !!data.toLowerCase().match(emailRegexp);
    })
  }
};

const BANK: ParameterType<Bank> = {
  component: Bank,
  props: {
    apiPath: 'bank',
    noItemsMessage: 'There are no Banks',
    placeholder: 'Search Bank',
    title: 'BANKS'
  }
};

const CREDIT_CARD: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'credit_card',
    info: "Please, insert your credit card md5 hash or your credit card number. Once you've entered your credit card number, its hash will be calculated. We will not send nor store your credit card number",
    noItemsMessage: 'There are no credit cards',
    placeholder: 'Insert your credit card md5 or your credit card number',
    title: 'CREDIT CARD',
    validation: yup
      .string()
      .transform((data) => {
        const isMd5 = !!data.match(/^[a-f0-9]{32}$/gm);
        const isCreditCard = !!data.match(/^[0-9]{12,19}$/gm);
        if (isMd5) return data;
        if (isCreditCard) return MD5(data);
        return '';
      })
      .test('credit-card', 'Invalid credit cards', (data) => data.length === 32)
  }
};

const SEARCH_WORDS: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'keyword',
    info: 'List of terms related to your Organization that could be contained inside documents of your interest. It is highly recommended to avoid generic terms such as confidential, private, etc. Minimun length is 3 characters.',
    noItemsMessage: 'There are no Search Words',
    placeholder: 'Insert your keyword(s)',
    title: 'SEARCH WORDS',
    validation: stringLength3
  }
};

const FILENAME: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'filename',
    info: 'Names or parts of a file name e.g. blueliv_confidential.docx e.g. security_report_blueliv.pdf',
    noItemsMessage: 'There are no File Names',
    placeholder: 'Insert your File Name(s)',
    title: 'FILE NAMES',
    validation: stringLength3
  }
};

const CONFIDENTIAL_FILTER: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'confidential',
    info: 'List of terms that are contained into a document and allows classifying it as Confidential e.g. restricted document e.g. confidential document',
    noItemsMessage: 'There are no Confidential Filters',
    placeholder: 'Insert your filter(s)',
    title: 'CONFIDENTIAL FILTERS',
    validation: stringLength3
  }
};

const FILE_EXTENSION_FILTER: ParameterType<FileExtensionFilter> = {
  component: FileExtensionFilter,
  props: {
    apiPath: 'file_extension',
    title: 'FILE EXTENSION FILTER',
    info: 'Hover over each type to see a list of extensions that will be filtered.'
  }
};

const termInfo =
  'List of terms related to your organization that could be affected by phishing attacks like company name, product name, etc. No spaces allowed.';
const TERM: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'keyword',
    info: termInfo,
    noItemsMessage: 'There are no Terms',
    placeholder: 'Insert your search terms',
    title: 'TERMS',
    validation: stringLength3.test('regex-spaces', termInfo, (data) => {
      return !!data.toLowerCase().match(regexSpace);
    })
  }
};

const infoTyposquattingKeyword =
  'List of keywords that can be found inside domain name trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces.';
const TYPOSQUATTING_KEYWORD: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'typosquatting',
    info: infoTyposquattingKeyword,
    noItemsMessage: 'There are no Typosquatting Keywords',
    placeholder: 'Insert your typosquatting keywords',
    title: 'TYPOSQUATTING KEYWORDS',
    validation: stringLength3.test('typosquatting', infoTyposquattingKeyword, (data) => {
      return !!data.toLowerCase().match(regexSpace);
    })
  }
};

const infoTyposquattingSimilarity =
  'List of keywords that will be used to find similar domain names trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces.';
const TYPOSQUATTING_SIMILARITY: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'typo_keyword_regex',
    info: infoTyposquattingSimilarity,
    noItemsMessage: 'There are no Typosquatting by Similarity',
    placeholder: 'Insert your search terms',
    title: 'TYPOSQUATTING BY SIMILARITY',
    validation: stringLength3.test('typo_keyword_regex', infoTyposquattingSimilarity, (data) => {
      return !!data.match(regexWithOutQuotes) && !data.match(regexUrlSpaces);
    })
  }
};

const TYPOSQUATTING_DISTANCE: ParameterType<TyposquattingDistance> = {
  component: TyposquattingDistance,
  props: {
    apiPath: 'typo_keyword_distance',
    title: 'TYPOSQUATTING BY DISTANCE',
    info: 'List of keywords that will be used to find domain names at a configurable distance trying to cheat your customers, partners or employees. Typosquatting Keywords cannot contain spaces. e.g.: example~2 would retrieve: esemple, ecanple, eexamplee,...',
    placeholder: 'Insert your typosquatting keywords',
    noItemsMessage: 'There are no Typosquatting by Distance',
    validation: stringLength4
  }
};

const PLATFORM_TECHNOLOGIES: ParameterType<PlatformTechnologies> = {
  component: PlatformTechnologies,
  props: {
    apiPath: 'CPE_TECH',
    placeholder: 'Platforms & Technologies',
    title: 'PLATFORMS & TECHNOLOGIES',
    info: 'Look for new vulnerabilities in a specialized set of sources for the selected platforms and technologies. The search will be transformed into a valid CPE based on Nist Data Base.',
    noItemsMessage: 'There are no Platforms & Technologies'
  },
  colSpan: 3
};

const rssInfo =
  'Insert the URL of the Hacktivist RSS that you want to follow. e.g. http://hacks.blogspot.com/feeds/posts/default';
const HACKTIVISM_RSS: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'RSS',
    title: 'HACKTIVISM RSS',
    info: rssInfo,
    placeholder: 'Insert your hacktivism RSS',
    noItemsMessage: 'There are no Hacktivism RSS',
    validation: stringLength3.test('RSS', rssInfo, (data) => {
      return !!data.match(
        /^((https?|ftp):\/\/)([\w\Q$-_+!*'(),%\E]+\.)+(\w{2,63})(:\d{1,4})?([\w\Q/$-_+!*'(),%\E]+\.?[\w])*\/?$/
      );
    }),
    adder: (value) => ({ title: value, url: value }),
    itemKey: 'title',
    itemValue: 'url'
  }
};

const twitterInfo = 'Insert the Twitter Profiles that you want to follow.';
const TWITTER_USERS: ParameterType<GenericParameter> = {
  component: GenericParameter,
  props: {
    apiPath: 'twitter_profile',
    info: twitterInfo,
    noItemsMessage: 'There are no Twitter Users',
    placeholder: 'Insert your Twitter Users',
    title: 'TWITTER USERS',
    validation: stringLength3.test('regex-twitter', twitterInfo, (data) => {
      return !!data.match(/^@(\w){1,15}$/);
    })
  }
};
const TWEETS_FROM_PROFILE: ParameterType<GenericParameter> = {
  ...TWITTER_USERS,
  props: {
    ...TWITTER_USERS.props,
    apiPath: 'tweets_from_profile'
  }
};

const RSS_CATEGORIES: ParameterType<RssCategories> = {
  component: RssCategories,
  props: {
    apiPath: 'extra_categories',
    title: 'RSS CATEGORIES',
    info: 'Insert the RSS Category that you want to follow.'
  }
};

const MARKETPLACE: ParameterType<Marketplace> = {
  component: Marketplace,
  props: {
    apiPath: 'marketplace',
    title: 'MARKETPLACE',
    info: 'Select the marketplaces where you want to search mobile apps. Official Markets includes: Google Play, Apple Store, Windows Phone, Blackberry World, Amazon Apps, Samsung Apps, etc. Alternative Markets includes: BlackMarkt, Aptoide, podnova, etc.'
  }
};

const INDUSTRY: ParameterType<Industry> = {
  component: Industry,
  props: {
    title: 'INDUSTRY',
    info: 'Industry description.'
  }
};

const REGION: ParameterType<Region> = {
  component: Region,
  props: {
    title: 'REGION',
    info: 'Region description'
  }
};

const COMPANY: ParameterType<Company> = {
  component: Company,
  props: {
    title: 'COMPANY',
    info: 'Company description'
  }
};

const PARAMETER_TYPES = {
  DOMAIN,
  IP,
  EMAIL,
  BANK,
  CREDIT_CARD,
  SEARCH_WORDS,
  FILENAME,
  CONFIDENTIAL_FILTER,
  FILE_EXTENSION_FILTER,
  TERM,
  TYPOSQUATTING_KEYWORD,
  TYPOSQUATTING_SIMILARITY,
  TYPOSQUATTING_DISTANCE,
  PLATFORM_TECHNOLOGIES,
  HACKTIVISM_RSS,
  TWITTER_USERS,
  TWEETS_FROM_PROFILE,
  RSS_CATEGORIES,
  MARKETPLACE,

  // TCX
  INDUSTRY,
  REGION,
  COMPANY
};

export default PARAMETER_TYPES;
