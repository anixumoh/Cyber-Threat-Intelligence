<script lang="ts">
  import EnableDisable from '$lib/components/EnableDisable/EnableDisable.svelte';
  import ViewDetailsItem from '$lib/components/ThreatsCommons/ViewDetailsItem.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { headerDetailsTerms } from '$lib/utils/headersDetailsTerms';
  import { currentModule } from '$stores/module';
  import { EarthFilled, Search, Time } from 'carbon-icons-svelte';

  export let resource = undefined;

  let headerData = headerDetailsTerms[$currentModule.moduleName === MODULE_NAME.SOCIAL_MEDIA ? 'social_media' : 'all'];
</script>

{#each headerData as header}
  <div class="w-full">
    <ul>
      {#each header as detailHeader}
        <li class="px-3 py-1 test">
          {#if detailHeader.value === 'searchPhrase'}
            <ViewDetailsItem title={detailHeader.name} value={resource?.searchPhrase ?? ''} icon={Search} />
          {:else if detailHeader.value === 'createdAt'}
            <ViewDetailsItem title={detailHeader.name} value={resource?.createdAt ?? ''} icon={Time} />
          {:else if detailHeader.value === 'searchEngines'}
            <ViewDetailsItem title={detailHeader.name} icon={Time}>
              <EnableDisable disabled isEnabled={resource?.searchEngines} />
            </ViewDetailsItem>
          {:else if detailHeader.value === 'searchTwitter'}
            <ViewDetailsItem title={detailHeader.name} icon={EarthFilled}>
              <EnableDisable disabled isEnabled={resource?.searchTwitter} />
            </ViewDetailsItem>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/each}
