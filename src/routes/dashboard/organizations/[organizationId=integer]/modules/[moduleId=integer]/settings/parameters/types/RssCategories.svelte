<script lang="ts">
  import Client from '$lib/client';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import { Checkbox } from 'carbon-components-svelte';
  import ParameterBase from './ParameterBase.svelte';

  export let apiPath: string;
  export let title: string;
  export let info: string;

  const CATEGORY_NAME_MAP = {
    ECONOMIC_PRESS: 'Economic press',
    SECURITY_COMPANIES: 'Security companies',
    SELF_REGULATORY_ORGANIZATION: 'Self regulatory organization',
    OFFICIAL_ORGANIZATION: 'Official organization',
    THINK_TANK: 'Think tank',
    BANKING_THINK_TANK: 'Banking think tank'
  };

  type RssCategoryItem = { name: keyof typeof CATEGORY_NAME_MAP; value: boolean };

  type SettingsRssCategoriesResponse = {
    type: string;
    values: RssCategoryItem[];
  };

  const client = new Client();

  let loading = false;
  let items: RssCategoryItem[] = [];
  let isSaving = false;

  $: getItems($currentOrganizationId, $currentModule, apiPath);

  async function getItems(organizationId: number, module: Module, apiPath: string) {
    loading = true;
    const response = await client.modules.getModuleSettings<SettingsRssCategoriesResponse>(
      organizationId,
      module,
      apiPath
    );
    items = response.values;
    loading = false;
  }

  function getName(name: keyof typeof CATEGORY_NAME_MAP) {
    return CATEGORY_NAME_MAP[name] || name;
  }

  async function onChange(name: string, checked: boolean) {
    isSaving = true;
    items = items.map((item) => {
      if (item.name === name) return { ...item, value: checked };
      return item;
    });
    const payload = {
      type: apiPath.toUpperCase(),
      values: items
    };
    try {
      await client.modules.setModuleSettings($currentOrganizationId, $currentModule, payload);
    } catch (error) {}
    isSaving = false;
  }
</script>

<ParameterBase {title} bind:items {loading} {info} itemKey="name" itemValue="value" hideSelectAll hideSearch>
  <svelte:fragment slot="item" let:item>
    <div class="flex justify-between items-center border-b border-solid border-ctip-light py-2 px-2 w-full">
      <div title={getName(item.name)} class="grid grid-flow-col items-center">
        <Checkbox
          disabled={isSaving || $roleStore.customer || $roleStore.operator}
          on:check={(e) => onChange(item.name, e.detail)}
          checked={item.value}
          value={item.name}
          class="m-0 mr-2 [&_label]:m-0"
        />
        <div class="overflow-hidden text-ellipsis whitespace-nowrap">
          {getName(item.name)}
        </div>
      </div>
    </div>
  </svelte:fragment>
</ParameterBase>
