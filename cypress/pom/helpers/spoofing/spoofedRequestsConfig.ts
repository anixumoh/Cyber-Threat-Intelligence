import { ENDPOINTS } from './endpoints.ts';
import { SpoofedRequestInfo } from './spoofedRequestInfo.ts';

export const spoofedRequests: Array<SpoofedRequestInfo> = [
  {
    endpoint: ENDPOINTS.AUTH,
    alias: 'faked_login',
    url: '/api/v2/auth',
    method: 'POST',
    fixture: 'common/fakedAuth.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.ACCOUNT,
    alias: 'faked_account',
    url: '/api/v2/user/account**',
    method: 'GET',
    fixture: '/common/fakedAccount.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.ACCOUNT_ANGULAR,
    alias: 'faked_account_angular',
    url: '/v2/user/account**',
    method: 'GET',
    fixture: '/common/fakedAccount.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.PREFERENCES,
    alias: 'faked_preferences',
    url: 'api/v2/user/preferences**',
    method: 'GET',
    fixture: 'common/fakedPreferences.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.PREFERENCES,
    alias: 'faked_preferences2',
    url: 'v2/user/preferences**',
    method: 'GET',
    fixture: 'common/fakedPreferences.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.ORGANIZATION,
    alias: 'faked_orgs',
    url: 'api/v2/organization**',
    method: 'GET',
    fixture: 'common/fakedOrganizations.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.ORGANIZATION,
    alias: 'faked_orgs_for_table',
    url: 'v2/organization**',
    method: 'GET',
    fixture: 'common/fakedOrganizations_for_table.json',
    cypressTests: ['OrderFilters', 'ExplorerModuleCreation']
  },
  {
    endpoint: ENDPOINTS.UNREAD_MESSAGES,
    alias: 'faked_unread_messages',
    url: 'api/v2/message/unread**',
    method: 'GET',
    fixture: '/common/fakedUnreadMessages.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.FORCED_MFA,
    alias: 'faked_forced_mfa',
    url: 'api/v2/user/forced_mfa**',
    method: 'GET',
    fixture: '/common/fakedForcedMfa.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.ENABLED2FA,
    alias: 'faked_enabled_2fa',
    url: 'api/v2/user/enable2FA**',
    method: 'GET',
    fixture: '/common/fakedEnabled2FA.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.ALERT_CONTENT,
    alias: 'faked_alert_content',
    url: 'api/v2/alert_configs/organization/**',
    method: 'GET',
    fixture: '/common/fakedAlertContent.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.LANGUAGE,
    alias: 'faked_languages',
    url: 'api/v2/language**',
    method: 'GET',
    fixture: '/common/fakedLanguages.json',
    cypressTests: ['Login']
  },

  {
    endpoint: ENDPOINTS.MODULES,
    alias: 'faked_modules',
    url: 'api/v2/organization/**/module**',
    method: 'GET',
    fixture: '/common/fakeModules.json',
    cypressTests: ['Login']
  },

  {
    endpoint: ENDPOINTS.MODULES_ANGULAR,
    alias: 'faked_modules',
    url: '/v2/organization/**/module**',
    method: 'GET',
    fixture: '/common/fakeModules.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.MODULES_ANGULAR,
    alias: 'faked_modules',
    url: '/v2/organization/**/module**',
    method: 'GET',
    fixture: '/common/fakeModules.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.RELEASE_NOTES,
    alias: 'faked_release_notes',
    url: 'api/v2/user/release_notes**',
    method: 'GET',
    fixture: '/common/fakedReleaseNotes.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.ISSUE_SUMMARY,
    alias: 'faked_issue_summary',
    url: 'api/v2/organization/**/issue/summary**',
    method: 'GET',
    fixture: '/common/fakedIssueSummary.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.THREATS,
    alias: 'faked_threat_list',
    url: 'api/v2/organization/**/resource?*',
    method: 'GET',
    fixture: 'threat/ThreatList.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.RESOURCES,
    alias: 'faked_resources',
    url: 'api/v2/chart/organization/**/resource_analytics?*',
    method: 'GET',
    fixture: '/common/fakedResources.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.THREAT_DETAILS,
    alias: 'faked_threat_details',
    url: 'api/v2/organization/**/resource/*?extraFields=**',
    method: 'GET',
    fixture: 'threat/ThreatDetails.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.EXTRA_DATA,
    alias: 'faked_extra_threat_data',
    url: 'api/v2/organization/**/extradata_info?notcache=**',
    method: 'GET',
    fixture: 'threat/ThreatExtraData.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.COMMENT,
    alias: 'faked_comment',
    url: 'api/v2/organization/**/resource/*/comment?notcache=*',
    method: 'GET',
    fixture: 'threat/ThreatComment.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.MARK_UNMARK,
    alias: 'faked_mark_unmark',
    url: 'api/v2/organization/**/resource/markAs?notcache=*',
    method: 'PUT',
    fixture: 'threat/ThreatMarkAs.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.RATE,
    alias: 'faked_rate_threat',
    url: 'api/v2/organization/**/resource/rating?notcache=*',
    method: 'PUT',
    fixture: 'threat/ThreatRate.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.FAVORITE,
    alias: 'faked_mark_favorite',
    url: 'api/v2/organization/**/resource/fav?notcache=*',
    method: 'PUT',
    fixture: 'threat/ThreatFavorite.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.LOGOUT,
    alias: 'faked_logout',
    url: 'api/v2/logout?notcache=*',
    method: 'GET',
    fixture: '/common/fakedLogout.json',
    cypressTests: ['Login']
  },
  {
    endpoint: ENDPOINTS.REODERFILTERS,
    alias: 'fakedReorderFilter',
    url: '/api/v2/organization/**/module/**/filter/**',
    method: 'PATCH',
    fixture: '/common/fakedPatchReorderFilter.json',
    cypressTests: ['OrderFilters']
  },
  {
    endpoint: ENDPOINTS.ORDERS,
    alias: 'fakedOrders',
    url: '/api/v2/organization/**/module/**/filter/orders**',
    method: 'GET',
    fixture: '/common/fakedOrders.json',
    cypressTests: ['OrderFilters']
  },
  {
    endpoint: ENDPOINTS.FILTERS,
    alias: 'fakedFilters',
    url: '/api/v2/organization/**/module/**/filter**',
    method: 'GET',
    fixture: '/common/fakedFilters.json',
    cypressTests: ['OrderFilters']
  },
  {
    endpoint: ENDPOINTS.MODULE_TYPES,
    alias: 'fakedModuleTypes',
    url: '/api/v2/moduletype/organization/**',
    method: 'GET',
    fixture: 'common/fakedModuleTypes.json',
    cypressTests: ['ExplorerModuleCreation']
  },
  {
    endpoint: ENDPOINTS.MODULE_TYPES,
    alias: 'fakedModuleTypes_angular',
    url: '/v2/moduletype/organization/**',
    method: 'GET',
    fixture: 'common/fakedModuleTypes.json',
    cypressTests: ['ExplorerModuleCreation']
  },
  {
    endpoint: ENDPOINTS.VERSION,
    alias: 'fakedVersion',
    url: '/api/v2/admin/version*',
    method: 'GET',
    fixture: '/common/fakedVersion.json',
    cypressTests: ['Version']
  },
  {
    endpoint: ENDPOINTS.INCIDENT_USERS,
    alias: 'fakedUsers',
    url: '/api/v2/organization/**/module/**/issue/users?q=&notcache=**',
    method: 'GET',
    fixture: 'threat/ThreatUsers.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.INCIDENTS,
    alias: 'fakedIncidents',
    url: '/api/v2/organization/**/module/**/issue/list?notcache=**',
    method: 'GET',
    fixture: 'threat/ThreatIncidents.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.INCIDENT_TYPES,
    alias: 'fakedIncident_types',
    url: '/api/v2/organization/**/module/**/issue/types?notcache=**',
    method: 'GET',
    fixture: 'threat/ThreatTypes.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.INCIDENT_ISSUE,
    alias: 'fakedIncident_issue',
    url: '/api/v2/organization/**/module/**/issue?notcache=**',
    method: 'GET',
    fixture: 'threat/ThreatIssue.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.ADDED_INCIDENT,
    alias: 'fakedAdded_Incident',
    url: '/api/v2/organization/**/module/**/issue?notcache=**',
    method: 'POST',
    fixture: 'threat/ThreatAddedIncident.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.INCIDENT_UPDATE,
    alias: 'fakedIncident_update',
    url: '/api/v2/organization/**/module/**/issue/*?notcache=**',
    method: 'POST',
    fixture: 'threat/ThreatAddedIncident.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.RESOURCE_ANALYTICS,
    alias: 'fakedresource_analytics',
    url: '/api/v2/organization/**/module/**/resource_analytics?**',
    method: 'POST',
    fixture: 'common/fakedResourceAnalytics.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.THREAT_LABEL_CREATE,
    alias: 'fakedCreateLabel',
    url: '/api/v2/label?notcache=**',
    method: 'POST',
    fixture: 'threat/ThreatLabel.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.THREAT_LABELS,
    alias: 'fakedThreatLabels',
    url: '/api/v2/organization/**/module/**/label?associated=**',
    method: 'GET',
    fixture: 'threat/ThreatLabels.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.THREAT_LABEL_UPDATE,
    alias: 'fakedThreatLabels',
    url: '/api/v2/organization/**/module/**/label?notcache=**',
    method: 'PUT',
    fixture: 'threat/ThreatUpdateLabel.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.THREAT_LABEL_DELETE,
    alias: 'fakedDeleteLabels',
    url: '/api/v2/organization/*/label/*?notcache=**',
    method: 'DELETE',
    fixture: 'threat/ThreatDelete.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.THREAT_LABEL_EDIT,
    alias: 'fakedEditLabel',
    url: '/api/v2/label/*?notcache=**',
    method: 'PUT',
    fixture: 'threat/ThreatLabel.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.THREAT_EXISTING_INCIDENT,
    alias: 'fakedExistingIncident',
    url: '/api/v2/organization/**/module/**/dark_web/resource/**/issue?notcache=**',
    method: 'GET',
    fixture: 'threat/ThreatAddedIncident.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.THREAT_REMOVE_INCIDENT,
    alias: 'fakedRemoveIncident',
    url: '/api/v2/organization/504/module/**/dark_web/resource/**/issue/**?notcache=**',
    method: 'DELETE',
    fixture: 'threat/ThreatRemoveIncident.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.AUTH_EXPIRED_PASSWORD,
    alias: 'faked_login_expired_password',
    url: '/api/v2/auth',
    method: 'POST',
    fixture: 'common/fakedAuthExpiredPass.json',
    statusCode: 401,
    cypressTests: ['ExpiredPassword']
  },
  {
    endpoint: ENDPOINTS.CHANGE_EXPIRED_PASSWORD,
    alias: 'faked_change_expired_password',
    url: '/api/v2/user/change_expired_password**',
    method: 'PUT',
    fixture: 'common/fakedChangedExpiredPass.json',
    cypressTests: ['ExpiredPassword']
  },
  {
    endpoint: ENDPOINTS.EXPORT_RESOURCES,
    alias: 'faked_export_resources',
    url: '/api/v2/organization/*/module/*/*/export?notcache=*',
    method: 'POST',
    statusCode: 200,
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.GET_RESOURCES,
    alias: 'faked_get_export_resources',
    url: '/api/v2/organization/*/module/*/resource/export?analysisCalcResult=**',
    method: 'GET',
    statusCode: 200,
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.GET_SEARCHWORDS,
    alias: 'faked_get_search_words',
    url: '/api/v2/organization/*/module/2902/*/resource?analysisCalcResult=**',
    method: 'GET',
    statusCode: 200,
    fixture: 'threat/ThreatSearchWords.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.MOVE_COPY_RESOURCES,
    alias: 'faked_move_copy_resources',
    url: '/api/v2/organization/*/module/*/resource/copyOrMoveTo?notcache=**',
    method: 'POST',
    fixture: 'threat/MoveOrCopyResource.json',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.CHANGE_STATUS,
    alias: 'faked_change_resource_status',
    url: '/api/v2/organization/*/module/*/*/resource/*/userResult/*?notcache=*',
    method: 'PUT',
    statusCode: 200,
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.MULTIPLE_CHANGE_STATUS,
    alias: 'faked_multiple_change_resource_status',
    url: ' /api/v2/organization/*/module/*/resource/setUserResultMultiple?notcache=*',
    method: 'PUT',
    statusCode: 200,
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.DELETED_RESOURCE,
    alias: 'faked_deleted_resource',
    url: '/api/v2/organization/*/module/*/*/resource?notcache=*',
    method: 'PUT',
    statusCode: 200,
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.BLOCK_URL,
    alias: 'faked_block_url_or_sub',
    url: '/api/v2/organization/*/module/*/resource/blacklist?notcache=*',
    method: 'POST',
    statusCode: 200,
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.BLOCK_DOMAIN,
    alias: 'faked_block_url_or_sub',
    url: '/api/v2/organization/*/module/*/resource/*/blacklist?notcache=*',
    method: 'POST',
    statusCode: 200,
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.FILTER_LABELS,
    alias: 'faked_filter_labels',
    url: '/api/v2/organization/*/module/*/resource/label?associated=**',
    fixture: 'threat/filterLabels.json',
    statusCode: 200,
    method: 'GET',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.FILTER_SOURCES,
    alias: 'faked_filter_sources',
    url: '/api/v2/organization/*/module/*/resource/sources?notcache=*',
    fixture: 'threat/filterSources.json',
    statusCode: 200,
    method: 'GET',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.FILTER_TERMS,
    alias: 'faked_filter_terms',
    url: '/api/v2/organization/*/module/*/*/resource/terms?notcache=*',
    fixture: 'threat/filterTerms.json',
    statusCode: 200,
    method: 'GET',
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.PREFERENCES,
    alias: 'faked_updated_preferences',
    url: '/api/v2/user/preferences?notcache=*',
    method: 'PUT',
    statusCode: 200,
    cypressTests: ['Threats']
  },
  {
    endpoint: ENDPOINTS.CHANGE_PASSWORD,
    alias: 'faked_change_password',
    url: '/api/v2/user/changepwd***',
    fixture: 'password_change/invalidResponse.json',
    statusCode: 400,
    method: 'PUT',
    cypressTests: ['Account']
  },
  {
    endpoint: ENDPOINTS.CVE_TERMS,
    alias: 'faked_CVE_terms',
    url: ' /api/v2/organization/*/module/*/explorer/resource/cves/terms?notcache=*',
    method: 'GET',
    fixture: 'modules/explorer/fakedCveTerms.json',
    statusCode: 200,
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.CVEs,
    alias: 'faked_CVEs',
    url: ' /api/v2/organization/*/module/*/explorer/resource/cves**',
    method: 'GET',
    fixture: 'modules/explorer/fakedCves.json',
    statusCode: 200,
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.CVE_MARK_AS_READ,
    alias: 'faked_MarkAsRead_CVE',
    url: ' /api/v2/organization/*/module/*/explorer/resource/cves/markAs?notcache=*',
    method: 'PUT',
    statusCode: 200,
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.GATEWAY,
    alias: 'faked_Gateway',
    url: '/v2/gateway?notcache=*',
    method: 'POST',
    fixture: 'modules/explorer/gateway.json',
    statusCode: 200,
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.APIGATEWAY,
    alias: 'faked_Gateway',
    url: '/api/v2/gateway?notcache=*',
    method: 'POST',
    fixture: 'modules/explorer/gateway.json',
    statusCode: 200,
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.ORGANIZATION,
    alias: 'faked_orgs2',
    url: '/v2/organization?notcache=**',
    method: 'GET',
    fixture: 'common/fakedOrganizations.json',
    cypressTests: ['CVEDetailsNavigation', 'Login']
  },
  {
    endpoint: ENDPOINTS.CVE_DETAILS,
    alias: 'faked_CVE_details',
    url: '/v2/organization/*/module/*/explorer/resource/cves/310209364**',
    method: 'GET',
    fixture: 'modules/explorer/fakedCve.json',
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.CVE_DETAILS,
    alias: 'faked_CVE_details',
    url: '/v2/organization/*/module/*/explorer/resource/cves/310054738**',
    method: 'GET',
    fixture: 'modules/explorer/fakedCveNextElement.json',
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.CVE_DETAILS,
    alias: 'faked_API_CVE_details',
    url: '/api/v2/organization/*/module/*/explorer/resource/cves/310209364**',
    method: 'GET',
    fixture: 'modules/explorer/fakedCve.json',
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.CVE_DETAILS,
    alias: 'faked_API_CVE_details',
    url: '/api/v2/organization/*/module/*/explorer/resource/cves/310054738**',
    method: 'GET',
    fixture: 'modules/explorer/fakedCveNextElement.json',
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.CVEs,
    alias: 'faked_CVEs',
    url: ' /v2/organization/*/module/*/explorer/resource/cves**',
    method: 'GET',
    fixture: 'modules/explorer/fakedCves.json',
    statusCode: 200,
    cypressTests: ['CVEDetailsNavigation']
  },
  {
    endpoint: ENDPOINTS.BANK_RESOUCE,
    alias: 'faked_bank_resource',
    url: '/api/v2/organization/**/module/**/credit_card/resource/**',
    method: 'GET',
    fixture: '/modules/credit_cards/bank_resource.json',
    cypressTests: ['NoTelegramLinkInBankResouce']
  },
  {
    endpoint: ENDPOINTS.RESOURCE_ANALYTICS,
    alias: 'faked_resource_analytics',
    url: '/api/v2/chart/organization/**/module/**/resource_analytics?timezone=Europe%2FMadrid&facet=TIME&orderBy=KEY&granularity=DAY&StatFilterSort=ASC&analysisCalcResult=POSITIVE,NEGATIVE,INFORMATIVE**',
    method: 'GET',
    fixture: 'common/empty.json',
    cypressTests: ['NoTelegramLinkInBankResouce']
  },
  {
    endpoint: ENDPOINTS.CREDIT_CARD_RESOURCE_ANALYSIS_RESULT,
    alias: 'faked_analysis_result',
    url: '/api/v2/organization/**/module/**/credit_card/resource?analysisCalcResult=POSITIVE,NEGATIVE,INFORMATIVE**',
    method: 'GET',
    fixture: '/modules/credit_cards/calc_result.json',
    cypressTests: ['NoTelegramLinkInBankResouce']
  },
  {
    endpoint: ENDPOINTS.CREDIT_CARD_RESOURCE_COMMENTS,
    alias: 'faked_credit_card_resource_comments',
    url: '/api/v2/organization/**/module/**/credit_card/resource/**/comment**',
    method: 'GET',
    fixture: 'common/empty.json',
    cypressTests: ['NoTelegramLinkInBankResouce']
  }
];
