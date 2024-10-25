<script lang="ts">
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import type { PreferencesType } from '$stores/preferences';
  import preferencesStore from '$stores/preferences';
  import { Button, Modal } from 'carbon-components-svelte';
  import { RadioButton, RadioButtonChecked, TrashCan } from 'carbon-icons-svelte';

  export let open = false;
  export let key: keyof PreferencesType['modules'][number][number]['tcxSearchSaved'];

  $: savedSearches =
    $preferencesStore?.modules?.[$currentOrganizationId]?.[$currentModuleId]?.tcxSearchSaved?.[key] ?? [];

  function onRemove(index: number) {
    $preferencesStore.modules[$currentOrganizationId][$currentModuleId].tcxSearchSaved[key].splice(index, 1);
    $preferencesStore = $preferencesStore;
    preferencesStore.setAndSave($preferencesStore);
  }

  function onSetDefault(index: number, val: boolean) {
    $preferencesStore.modules[$currentOrganizationId][$currentModuleId].tcxSearchSaved[key].map(
      (search) => (search.markAsDefault = false)
    );
    $preferencesStore.modules[$currentOrganizationId][$currentModuleId].tcxSearchSaved[key][index].markAsDefault = val;
    preferencesStore.setAndSave($preferencesStore);
  }
</script>

<Modal
  primaryButtonText="Close"
  on:click:button--primary={() => (open = false)}
  modalHeading="Manage your searches"
  bind:open
>
  <div class="py-4">
    {#each savedSearches as search, i}
      {#if search}
        <div class="p-3 border flex justify-between" title={search.dork}>
          <div>
            {search.name}
          </div>
          <div>
            <Button
              on:click={() => onSetDefault(i, !search.markAsDefault)}
              size="small"
              kind="ghost"
              icon={search.markAsDefault ? RadioButtonChecked : RadioButton}
              iconDescription={search.markAsDefault ? 'Remove default' : 'Mark as default'}
            />
            <Button
              on:click={() => onRemove(i)}
              --cds-icon-01="var(--ctip-danger)"
              size="small"
              kind="ghost"
              icon={TrashCan}
              iconDescription="Remove"
            />
          </div>
        </div>
      {/if}
    {:else}
      <p>You haven't saved any searches.</p>
    {/each}
  </div>
</Modal>
