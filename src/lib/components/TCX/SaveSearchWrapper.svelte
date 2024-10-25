<script lang="ts">
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import type { PreferencesType } from '$stores/preferences';
  import preferencesStore from '$stores/preferences';
  import { Modal, TextInput } from 'carbon-components-svelte';

  export let open = false;
  export let key: keyof PreferencesType['modules'][number][number]['tcxSearchSaved'];
  export let dork: string;

  let name = '';

  async function onSave() {
    try {
      if (!$preferencesStore[$currentOrganizationId]) {
        $preferencesStore[$currentOrganizationId] = {};
      }
      if (!$preferencesStore.modules[$currentOrganizationId][$currentModuleId]) {
        $preferencesStore.modules[$currentOrganizationId][$currentModuleId] = {
          tcxSearchSaved: {}
        };
      }
      if (!$preferencesStore.modules[$currentOrganizationId][$currentModuleId].tcxSearchSaved[key]) {
        $preferencesStore.modules[$currentOrganizationId][$currentModuleId].tcxSearchSaved[key] = [];
      }

      $preferencesStore.modules[$currentOrganizationId][$currentModuleId].tcxSearchSaved[key].push({
        dork,
        name,
        markAsDefault: false
      });
      preferencesStore.setAndSave($preferencesStore);
    } finally {
      open = false;
      name = '';
    }
  }

  $: dorkAlreadyExists = !!$preferencesStore?.modules?.[$currentOrganizationId]?.[$currentModuleId]?.tcxSearchSaved?.[
    key
  ]?.some((search) => search?.dork === dork);
</script>

<slot {dorkAlreadyExists} />

<Modal
  secondaryButtonText="Close"
  primaryButtonText="Save"
  on:click:button--secondary={() => (open = false)}
  on:click:button--primary={onSave}
  primaryButtonDisabled={!dork || !name}
  modalHeading="Save your search"
  bind:open
>
  <div class="py-4">
    <TextInput labelText="Name" bind:value={name} />
  </div>
</Modal>
