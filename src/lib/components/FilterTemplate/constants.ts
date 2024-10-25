import { domainRegex } from '$lib/utils/regexPatterns';
import * as yup from 'yup';

export const analysisResultArray = [
  { name: 'Not Available', key: 0 },
  { name: 'Important', key: 6 },
  { name: 'Positive', key: 3, disabled: true },
  { name: 'Negative', key: 4, disabled: true },
  { name: 'Informative', key: 5, disabled: true },
  { name: 'Not Important', key: 1 },
  { name: 'Not Processable', key: 2 }
];

export const fileTypeArray = [
  { name: 'Html', key: 0, formats: 'html, xhtml' },
  { name: 'Image', key: 1, formats: 'Any content type that starts with image/' },
  { name: 'Document', key: 2, formats: 'doc, rtf, xls, vsd, pps, ppt, pdf' },
  { name: 'Others', key: 3, formats: 'Any extension not included previously' }
];

export const analysisResultActionsArray = [
  { name: 'Important', key: 6 },
  { name: 'Positive', key: 3 },
  { name: 'Negative', key: 4 },
  { name: 'Informative', key: 5 },
  { name: 'Not Important', key: 1 }
];

export const CONDITION_TYPES = {
  TERM: 'TERM',
  HAS_LABEL: 'HAS_LABEL',
  ANALYSIS_RESULT: 'ANALYSIS_RESULT',
  ORIGIN: 'ORIGIN',
  FILTER_PHRASE: 'FILTER_PHRASE',
  DOMAIN: 'DOMAIN', // include only if exists
  EXTRADATA_ENTRY: 'EXTRADATA_ENTRY', // include only if exists
  FILE_TYPE: 'FILE_TYPE',
  LANGUAGE: 'LANGUAGE',
  COUNTRY: 'COUNTRY'
};

export const conditionsSchema = yup.object().shape({
  name: yup.string().required(),
  enabled: yup.boolean(),
  terms: yup.array().of(yup.number()),
  termsInversed: yup.boolean(),
  labels: yup.array().of(yup.number()),
  labelsInversed: yup.boolean(),
  analysisstatus: yup.array().of(yup.number()),
  origins: yup.array(),
  originsInversed: yup.boolean(),
  filterPhrase: yup.string(),
  filterphraseInversed: yup.boolean(),
  domain: yup.string().test('is-domain', 'Please, provide a valid domain', (domain) => {
    if (!domain) return true;
    return !!domain.match(domainRegex);
  }),
  domainInversed: yup.boolean(),
  extradataKey: yup.string(),
  extradataValue: yup.string(),
  extradataInversed: yup.boolean(),
  extradata: yup.object(),
  filetypes: yup.array().of(yup.number()),
  languages: yup.array(),
  languagesInversed: yup.boolean(),
  countries: yup.array(),
  countriesInversed: yup.boolean()
});

export const actionsSchema = yup.object({
  labels: yup.array(),
  analysisResult: yup.number().nullable(),
  tlp: yup.string(),
  rating: yup.number().nullable(),
  filterExecutionStop: yup.boolean(),
  filterExecutioStopDelete: yup.boolean(),
  launchAlert: yup.boolean(),
  threshold: yup.number().min(1).max(999),
  interval: yup.number().min(1).max(999),
  sendAlert: yup.boolean(),
  destinations: yup.array().of(
    yup.object({
      usersId: yup.number().nullable(),
      usersName: yup.string().nullable(),
      userEmail: yup.string().email(),
      emailEnabled: yup.boolean()
    })
  ),
  alertContentFields: yup.array().of(
    yup.object({
      name: yup.string(),
      enable: yup.boolean()
    })
  )
});

export const ContentAlertValues = {
  TITLE: 'Title',
  CREATED_AT: 'Creation date',
  LABELS: 'Labels',
  SEARCH_WORD: 'Search word',
  CARDS: 'Cards found',
  HARDCODED: 'Hardcoded text',
  DESCRIPTION: 'Description',
  MARKET: 'Market',
  PLATFORM: 'Platform',
  SCORE: 'Score',
  VENDOR: 'Vendor',
  PRODUCT: 'Product',
  VERSION: 'Version',
  RISK: 'Risk'
};
