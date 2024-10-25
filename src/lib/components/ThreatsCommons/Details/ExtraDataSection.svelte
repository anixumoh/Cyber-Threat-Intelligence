<script lang="ts">
  import modalTeleport from '$lib/actions/modalTeleport';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import ResourceLabelModal from '$lib/components/ResourceLabelModal.svelte';
  import TcxLinkeable from '$lib/components/TcxLinkeable/TcxLinkeable.svelte';
  import Severity from '$lib/components/ThreatsCommons/Severity/index.svelte';
  import type { HeaderKey } from '$lib/utils/headersDetailsThreats';
  import roleStore from '$stores/role';
  import threatsStore from '$stores/threats';
  import { CopyButton, TooltipDefinition, TooltipIcon } from 'carbon-components-svelte';
  import {
    CheckboxCheckedFilled,
    CheckboxIndeterminateFilled,
    Debug,
    EarthFilled,
    Edit,
    Email,
    PanHorizontal,
    Password,
    Tag,
    User,
    Warning,
    WarningFilled
  } from 'carbon-icons-svelte';
  import ViewDetailsItem from '../ViewDetailsItem.svelte';
  import ActionFile from './ActionFile.svelte';
  import ActionLanguage from './ActionLanguage.svelte';
  import ActionRating from './ActionRating.svelte';
  import ActionSources from './ActionSources.svelte';
  import ActionStatus from './ActionStatus.svelte';
  import ActionUrl from './ActionUrl.svelte';

  export let headerData: HeaderKey[] = [];

  let openLabelsModal = false;

  function onLabelSave(event) {
    const resourceLabelIds = $threatsStore.selectedForDetails.labels.map((label) => label.id);
    const labelsToInclude = event.detail.added.filter((label) => !resourceLabelIds.includes(label.id));
    const labels = [
      ...labelsToInclude,
      ...$threatsStore.selectedForDetails.labels.filter((label) => !event.detail.removedIds.includes(label.id))
    ];
    $threatsStore.selectedForDetails.labels = labels;
  }
</script>

<div class="grid m-2">
  {#each headerData as detailHeader}
    {@const show = detailHeader.show ? detailHeader.show($threatsStore.selectedForDetails) : true}
    {@const hasData =
      (detailHeader?.value && detailHeader.value in $threatsStore.selectedForDetails) ||
      !!detailHeader.display ||
      !!detailHeader.key}
    {#if show && hasData}
      <div class="[&>*]:mt-2">
        {#if detailHeader.value === 'rating'}
          <ActionRating title={detailHeader.name} tooltipText={detailHeader.tooltip} />
        {:else if detailHeader.value === 'file' && $threatsStore.selectedForDetails?.file}
          <ActionFile title={detailHeader.name} tooltipText={detailHeader.tooltip} />
        {:else if detailHeader.value === 'selectedCountry' && $threatsStore.selectedForDetails?.selectedCountry && $threatsStore.selectedForDetails?.selectedCountry !== '-'}
          <ViewDetailsItem
            title={detailHeader.name}
            value={$threatsStore.selectedForDetails.selectedCountry}
            icon={detailHeader.icon ?? EarthFilled}
            tooltipText={detailHeader.tooltip}
          />
        {:else if detailHeader.value === 'languageId' && $threatsStore.selectedForDetails?.languageId}
          <ActionLanguage tooltipText={detailHeader.tooltip} />
        {:else if detailHeader.value === 'labels'}
          <ViewDetailsItem title={detailHeader.name} icon={Tag} action buttonAction tooltipText={detailHeader.tooltip}>
            <svelte:fragment slot="buttonAction">
              {#if !$roleStore.trial && !$roleStore.customer}
                <GenericButton on:click={() => (openLabelsModal = true)} iconDescription="Edit Labels">
                  <Edit />
                </GenericButton>
              {/if}
            </svelte:fragment>
            <svelte:fragment slot="action">
              {#if $threatsStore.selectedForDetails.labels.length}
                <div class="flex flex-wrap justify-end">
                  {#each $threatsStore.selectedForDetails.labels as label}
                    <LabelItem {label} />
                  {/each}
                </div>
              {/if}
            </svelte:fragment>
          </ViewDetailsItem>
        {:else if detailHeader.value === 'analysisCalcResult'}
          <ActionStatus title={detailHeader.name} tooltipText={detailHeader.tooltip} />
        {:else if detailHeader.value === 'transform' && $threatsStore.selectedForDetails?.transform}
          <ViewDetailsItem
            title={detailHeader.name}
            value={$threatsStore.selectedForDetails.transform}
            icon={PanHorizontal}
            tooltipText={detailHeader.tooltip}
          />
        {:else if detailHeader.value === 'domain' && $threatsStore.selectedForDetails?.domain}
          <ViewDetailsItem
            title={detailHeader.name}
            value={$threatsStore.selectedForDetails.domain}
            icon={detailHeader.icon ?? EarthFilled}
            tooltipText={detailHeader.tooltip}
          />
        {:else if detailHeader.value === 'email' && ($threatsStore.selectedForDetails.email || $threatsStore.selectedForDetails.email === 0)}
          <ViewDetailsItem
            title={detailHeader.name}
            value={$threatsStore.selectedForDetails.email}
            icon={detailHeader.icon ?? Email}
            tooltipText={detailHeader.tooltip}
          />
        {:else if detailHeader.value === 'employee' && ($threatsStore.selectedForDetails.employee || $threatsStore.selectedForDetails.employee === 0)}
          <ViewDetailsItem
            title={detailHeader.name}
            value={$threatsStore.selectedForDetails.employee}
            icon={detailHeader.icon ?? User}
            tooltipText={detailHeader.tooltip}
          />
        {:else if detailHeader.value === 'customer' && ($threatsStore.selectedForDetails.customer || $threatsStore.selectedForDetails.customer === 0)}
          <ViewDetailsItem
            title={detailHeader.name}
            value={$threatsStore.selectedForDetails.customer}
            icon={detailHeader.icon ?? User}
            tooltipText={detailHeader.tooltip}
          />
        {:else if detailHeader.value === 'external' && ($threatsStore.selectedForDetails.external || $threatsStore.selectedForDetails.external === 0)}
          <ViewDetailsItem
            title={detailHeader.name}
            value={$threatsStore.selectedForDetails.external}
            icon={detailHeader.icon ?? User}
            tooltipText={detailHeader.tooltip}
          />
        {:else if detailHeader.key === 'password'}
          <ViewDetailsItem title={detailHeader.name} icon={Password} action tooltipText={detailHeader.tooltip}>
            <svelte:fragment slot="action">
              {#if $threatsStore.selectedForDetails.credential?.userPassword}
                <div
                  title={$threatsStore.selectedForDetails.credential.userPassword}
                  class="max-w-xs overflow-hidden whitespace-nowrap text-ellipsis"
                >
                  {$threatsStore.selectedForDetails.credential.userPassword}
                </div>
              {:else}
                <span class="flex items-center no-password">
                  <span class="pr-1">No password available</span>
                  <TooltipIcon
                    tooltipText="The password of this credential was not available at the source of the data breach"
                    icon={WarningFilled}
                  />
                </span>
              {/if}
            </svelte:fragment>
          </ViewDetailsItem>
        {:else if detailHeader.key === 'credential.isEmail'}
          <ViewDetailsItem title={detailHeader.name} icon={Email} action tooltipText={detailHeader.tooltip}>
            <svelte:fragment slot="action">
              {#if $threatsStore.selectedForDetails.credential?.isEmail}
                <CheckboxCheckedFilled size={24} class="fill-ctip-success" />
              {:else}
                <CheckboxIndeterminateFilled size={24} class="fill-ctip-danger" />
              {/if}
            </svelte:fragment>
          </ViewDetailsItem>
        {:else if detailHeader.key === 'credential.type'}
          <ViewDetailsItem title={detailHeader.name} icon={Debug} action tooltipText={detailHeader.tooltip}>
            <svelte:fragment slot="action">
              {#if $threatsStore.selectedForDetails.credential?.type}
                <TcxLinkeable value={$threatsStore.selectedForDetails.credential.type} />
              {:else}
                Not available
              {/if}
            </svelte:fragment>
          </ViewDetailsItem>
        {:else if detailHeader.value === 'severity'}
          <ViewDetailsItem title="severity" icon={Warning} action tooltipText={detailHeader.tooltip}>
            <svelte:fragment slot="action">
              <Severity severity={$threatsStore.selectedForDetails.severity} />
            </svelte:fragment>
          </ViewDetailsItem>
        {:else if detailHeader.isCopy}
          {@const val = detailHeader.display
            ? detailHeader.display($threatsStore.selectedForDetails)
            : $threatsStore.selectedForDetails?.[detailHeader.value]}
          <ViewDetailsItem
            title={detailHeader.name}
            icon={detailHeader.icon ?? EarthFilled}
            action
            tooltipText={detailHeader.tooltip}
          >
            <svelte:fragment slot="action">
              <div class="flex text-left">
                <CopyButton text={val} />
                <TooltipDefinition tooltipText={val}>
                  <span class="max-w-[260px] truncate text-sm">{val}</span>
                </TooltipDefinition>
              </div>
            </svelte:fragment>
          </ViewDetailsItem>
        {:else if detailHeader.isUrl}
          {@const text = detailHeader.display
            ? detailHeader.display($threatsStore.selectedForDetails)
            : $threatsStore.selectedForDetails?.[detailHeader.value]}
          {@const toCopy = (detailHeader.value === 'url' && $threatsStore.selectedForDetails?.originalUrl) || text}
          {#if text}
            <ActionUrl
              title={detailHeader.name}
              {text}
              {toCopy}
              icon={detailHeader.icon ?? EarthFilled}
              width="w-full max-w-[250px]"
              tooltipText={detailHeader.tooltip}
            />
          {:else}
            <ViewDetailsItem
              title={detailHeader.name}
              value="Not available"
              icon={detailHeader.icon ?? EarthFilled}
              tooltipText={detailHeader.tooltip}
            />
          {/if}
        {:else if detailHeader.display}
          <ViewDetailsItem
            title={detailHeader.name}
            value={String(detailHeader.display($threatsStore.selectedForDetails))}
            icon={detailHeader.icon ?? EarthFilled}
            tooltipText={detailHeader.tooltip}
          />
        {:else if detailHeader.value === 'sources'}
          <ActionSources tooltipText={detailHeader.tooltip} />
        {:else if $threatsStore.selectedForDetails?.[detailHeader.value]}
          <ViewDetailsItem
            title={detailHeader.name}
            value={$threatsStore.selectedForDetails?.[detailHeader.value]}
            icon={detailHeader.icon ?? EarthFilled}
            tooltipText={detailHeader.tooltip}
          />
        {:else}
          <!-- {detailHeader.value} - {$threatsStore.selectedForDetails[detailHeader.value]} -->
        {/if}
      </div>
    {/if}
  {/each}
</div>

<div use:modalTeleport>
  <ResourceLabelModal
    bind:open={openLabelsModal}
    resources={[$threatsStore.selectedForDetails]}
    on:save={onLabelSave}
  />
</div>
