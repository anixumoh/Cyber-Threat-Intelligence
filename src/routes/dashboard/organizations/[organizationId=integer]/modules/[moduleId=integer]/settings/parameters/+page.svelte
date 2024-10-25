<script lang="ts">
  import Client from '$lib/client';
  import { type ModuleNameType, MODULE_NAME } from '$lib/constants/modules';
  import type Module from '$lib/types/module';
  import { currentModule, currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import { SkeletonPlaceholder, Tag } from 'carbon-components-svelte';
  import PARAMETER_TYPES from './constants';

  type PARAMETER_KEYS = keyof typeof PARAMETER_TYPES;

  const MODULE_FIELDS: Partial<Record<ModuleNameType, PARAMETER_KEYS[]>> = {
    [MODULE_NAME.CREDENTIAL]: ['DOMAIN', 'IP', 'EMAIL'],
    [MODULE_NAME.CREDIT_CARD]: ['BANK', 'CREDIT_CARD'],
    [MODULE_NAME.DARK_WEB]: ['DOMAIN', 'IP', 'SEARCH_WORDS'],
    [MODULE_NAME.DATA_LEAKAGE]: ['SEARCH_WORDS', 'DOMAIN', 'FILENAME', 'CONFIDENTIAL_FILTER', 'FILE_EXTENSION_FILTER'],
    [MODULE_NAME.DOMAIN_PROTECTION]: [
      'DOMAIN',
      'TERM',
      'TYPOSQUATTING_KEYWORD',
      'TYPOSQUATTING_SIMILARITY',
      'TYPOSQUATTING_DISTANCE'
    ],
    [MODULE_NAME.HACKTIVISM]: [
      'DOMAIN',
      'IP',
      'SEARCH_WORDS',
      'PLATFORM_TECHNOLOGIES',
      'HACKTIVISM_RSS',
      'TWITTER_USERS'
    ],
    [MODULE_NAME.MALWARE]: ['DOMAIN', 'IP'],
    [MODULE_NAME.MEDIA_TRACKER]: ['SEARCH_WORDS', 'HACKTIVISM_RSS', 'TWEETS_FROM_PROFILE', 'RSS_CATEGORIES'],
    [MODULE_NAME.MOBILE_APPS]: ['SEARCH_WORDS', 'MARKETPLACE'],
    [MODULE_NAME.EXPLORER]: ['PLATFORM_TECHNOLOGIES'],
    [MODULE_NAME.THREAT_CONTEXT]: ['INDUSTRY', 'REGION', 'COMPANY']
  };

  const client = new Client();

  let unclassifiedAssets = 0;
  let isLoadingUnclassified = false;

  $: components = MODULE_FIELDS[$currentModule.moduleName] ?? [];
  $: canSeeClassify = $currentModule.moduleName === MODULE_NAME.CREDENTIAL && !$roleStore.customer;
  $: canSeeClassify && getDomainAssets($currentOrganizationId, $currentModule);

  async function getDomainAssets(organizationId: number, module: Module) {
    isLoadingUnclassified = true;
    const response = await client.modules.getDomainAssets(organizationId, module);
    unclassifiedAssets = response?.UNCLASSIFIED?.length ?? 0;
    isLoadingUnclassified = false;
  }
</script>

<div class="grid gap-8 mb-4 lg:grid-cols-3">
  {#each components as key}
    <div class:col-span-3={PARAMETER_TYPES[key].colSpan === 3} class:col-span-2={PARAMETER_TYPES[key].colSpan == 2}>
      <svelte:component this={PARAMETER_TYPES[key].component} {...PARAMETER_TYPES[key].props} />
    </div>
  {/each}
</div>

{#if canSeeClassify}
  {#if isLoadingUnclassified}
    <SkeletonPlaceholder class="w-56 h-5" />
  {:else}
    <span>
      There are <Tag type={unclassifiedAssets ? 'blue' : 'gray'}>{unclassifiedAssets}</Tag> unclassified assets.
    </span>
    {#if unclassifiedAssets}
      <a
        class="ml-2 text-base"
        href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/settings/classification"
      >
        Classify them.
      </a>
    {/if}
  {/if}
{/if}
