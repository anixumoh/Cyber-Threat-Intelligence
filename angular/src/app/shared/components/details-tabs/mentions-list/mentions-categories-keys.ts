export const mentionsCategoriesKeys = [
  'BLUELIV_COMMUNITY',
  'CLEARNET_FORUM',
  'CODE_REPOSITORY',
  'DARKWEB',
  'DOC_REPOSITORY',
  'HACKTIVISM',
  'INTERNET_SCANNERS',
  'NEWS',
  'OTHERS',
  'PASTES',
  'SEARCH_ENGINE',
  'SECURITY_NEWS',
  'SECURITY_VENDORS',
  'SOCIAL',
  'WEBSITES',
];

export function getMentionsCategoryLabel(categoryKey: string) {
  if (categoryKey) {
    return categoryKey.replace(/_/g, ' ');
  }
  return '-';
}
