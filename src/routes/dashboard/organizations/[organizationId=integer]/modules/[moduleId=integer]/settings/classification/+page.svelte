<script lang="ts">
  import type { ClassificationItem, ClassificationKeys } from '$lib/client/services/modules';
  import Client from '$lib/client';
  import Autocomplete from '$lib/components/Autocomplete.svelte';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import {
    Button,
    FormGroup,
    InlineLoading,
    Search,
    SkeletonPlaceholder,
    TextInput,
    TooltipIcon
  } from 'carbon-components-svelte';
  import { onDestroy } from 'svelte';
  import { InformationFilled, TrashCan } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';
  import * as yup from 'yup';
  import notifications from '$stores/notification';
  import { validateDomainWithSubdomain } from '$lib/utils/regexPatterns';
  import roleStore from '$stores/role';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';

  const subdomainAndDomain = (subdomain: string, domain: string) =>
    `${subdomain}${subdomain.endsWith('.') ? '' : '.'}${domain}`;
  const domainAndPath = (domain: string, path: string) => `${domain}${path ? '/' : ''}${path}`;

  const schema = yup.object({
    subdomain: yup.string().test('valid-subdomain', 'Invalid subdomain', (subdomain) => {
      if (!subdomain) return true;
      const url = subdomainAndDomain(subdomain, $data.domain);
      return !!url.match(validateDomainWithSubdomain);
    }),
    domain: yup.string().required(),
    path: yup.string().test('valid-path', 'Invalid path or has more than 190 characters.', (path) => {
      const url = domainAndPath(subdomainAndDomain($data.subdomain, $data.domain), path);
      return url.length < 190;
    })
  });

  const { form, isValid, errors, isSubmitting, data, reset, setData } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      const domains = subdomainAndDomain(values.subdomain, values.domain);
      const url = domainAndPath(values.domain, values.path);
      let finalUrl = values.path ? `${domains}/${values.path}` : domains;
      const alreadyExists = Object.entries(classification)
        .map(([_, obj]) => obj.items)
        .flat()
        .some((item) => item.value === finalUrl);

      if (alreadyExists) {
        const subtitle = `${finalUrl} already exists`;
        reset();
        return notifications.notify({ kind: 'error', title: 'Error', subtitle });
      }
      loading = true;
      //only first and second inputs are filled
      if (values.subdomain && !values.path) {
        //if the subdomain ends with a dot, remove it
        if (values.subdomain.endsWith('.')) {
          values.subdomain = values.subdomain.replace(/\.$/, '');
        }
        if (values.subdomain.split('.').length > 1) {
          await client.modules.classify($currentOrganizationId, $currentModule, 'UNCLASSIFIED', {
            id: undefined,
            value: domains
          });
        } else {
          await createNewUnclassified(domains);
        }
      }
      //only third input is filled
      if (!values.subdomain && values.path) {
        await createDomainAsset(url);
      }
      //all inputs are filled (1st and 3rd)
      if (values.subdomain && values.path) {
        let urlToAdd = `${domains}/${values.path}`;
        await client.modules.classify($currentOrganizationId, $currentModule, 'UNCLASSIFIED', {
          id: undefined,
          value: urlToAdd
        });
      }

      await getDomainAssets();
      loading = false;
      reset();
    }
  });

  $: valid = ($isValid && $data.domain && $data.subdomain) || ($data.domain && $data.path);

  const client = new Client();
  onDestroy(() => client.abort());

  let loading = true;
  let warningModalOpen = false;
  let deletingItem: ClassificationItem;
  let deletingItemkey: string;
  let notificationDisabled = false;
  let domainNames: string[] = [];
  let classificationHover: string;
  let draggingInfo: { key: string; itemIndex: number };

  type Classification = Record<
    ClassificationKeys,
    {
      title: string;
      items: ClassificationItem[];
      search: string;
    }
  >;

  let classification: Classification = {
    UNCLASSIFIED: {
      title: 'Unclassified assets',
      items: [],
      search: ''
    },
    EMPLOYEE: {
      title: 'Employee',
      items: [],
      search: ''
    },
    CUSTOMER: {
      title: 'Customer',
      items: [],
      search: ''
    },
    EXTERNAL: {
      title: 'External',
      items: [],
      search: ''
    }
  };
  $: unclassifiedItems = classification.UNCLASSIFIED.items.length;

  $: init($currentOrganizationId, $currentModule);

  async function init(orgId: number, module: Module) {
    loading = true;
    await Promise.all([getCredentialDomains(), getDomainAssets()]);
    loading = false;
  }

  async function getCredentialDomains() {
    domainNames = await client.modules.getCredentialDomains($currentOrganizationId, $currentModule.id);
  }

  async function getDomainAssets() {
    const assets = await client.modules.getDomainAssets($currentOrganizationId, $currentModule);
    classification.UNCLASSIFIED.items = assets?.UNCLASSIFIED ?? [];
    classification.EMPLOYEE.items = assets?.EMPLOYEE ?? [];
    classification.CUSTOMER.items = assets?.CUSTOMER ?? [];
    classification.EXTERNAL.items = assets?.EXTERNAL ?? [];
  }

  function dragStart(event: DragEvent, key: string, itemIndex: number) {
    draggingInfo = { key, itemIndex };
  }

  function drop(event: DragEvent, key: ClassificationKeys) {
    event.preventDefault();
    if (draggingInfo && draggingInfo?.key !== key) {
      const [item] = classification[draggingInfo.key].items.splice(draggingInfo.itemIndex, 1);
      classification[key].items.push(item);
      classification = classification;

      if (data.key !== key) {
        classify(key, item);
      }
    }

    classificationHover = null;
    draggingInfo = null;
  }

  async function classify(key: ClassificationKeys, item: ClassificationItem) {
    client.modules.classify($currentOrganizationId, $currentModule, key, item);
    if (notificationDisabled) return;
    const subtitle = 'The changes in the classification will be applied in a maximum time of 24h';
    notificationDisabled = true;
    setTimeout(() => {
      notificationDisabled = false;
    }, 5000);
    notifications.notify({ kind: 'warning', title: 'Warning', subtitle });
  }

  async function createDomainAsset(url: string) {
    return client.modules.createDomainAsset($currentOrganizationId, $currentModule, url);
  }

  async function createNewUnclassified(domain: string) {
    const response = await client.modules.createNewUnclassified($currentOrganizationId, $currentModule, domain);
    if (Array.isArray(response?.data?.error)) {
      notifications.notify({
        kind: 'error',
        title: 'Invalid and not added',
        subtitle: response.data.error.join(', ')
      });
    }
  }
  async function deleteClassification() {
    if (!deletingItem.id) {
      try {
        warningModalOpen = false;
        loading = true;
        await client.modules.deleteClassification($currentOrganizationId, $currentModule, deletingItem.value);
        classification[deletingItemkey].items = classification[deletingItemkey].items.filter(
          (i) => i.value !== deletingItem.value
        );
        classification = classification;
        deletingItem = null;
        deletingItemkey = null;
      } catch (error) {
        notifications.notify({ kind: 'error', title: 'Error', subtitle: error.message });
      } finally {
        loading = false;
      }
    }
  }
</script>

<div class="text-base border-b-2 border-solid border-ctip-primary">Select your Assets</div>

<div class="mt-4">
  {#if !($roleStore.operator || $roleStore.customer)}
    <form
      use:form
      class="grid justify-center md:grid-cols-[1fr_1fr_1fr_60px] bg-ctip-ui md:justify-between gap-8 px-2.5 pt-2.5 items-center"
    >
      <FormGroup class="w-full">
        <TextInput
          light
          name="subdomain"
          placeholder={$data.domain ? 'Insert your subdomain' : 'Select a domain first'}
          disabled={!$data.domain}
          invalid={!!$errors.subdomain}
          invalidText={$errors.subdomain?.[0]}
        />
      </FormGroup>
      <FormGroup class="relative w-full">
        <span class="absolute bottom-0 left-0 hidden -ml-6 text-4xl md:block">.</span>
        <Autocomplete
          light
          name="domain"
          items={domainNames.map((domain) => ({ domain }))}
          value="domain"
          display="domain"
          bind:selectedValue={$data.domain}
          placeholder="Select domain"
        />
        <span class="absolute bottom-0 right-0 hidden -mr-6 text-4xl md:block">/</span>
      </FormGroup>
      <FormGroup class="w-full">
        <TextInput
          light
          name="path"
          placeholder={$data.domain ? 'Insert your path' : 'Select a domain first'}
          disabled={!$data.domain}
          pattern="^([\w\d-_]+\/?)+$"
          invalid={!!$errors.path}
          invalidText={$errors.path?.[0]}
        />
      </FormGroup>
      <FormGroup class="w-full">
        <GenericButton
          disabled={!valid || $isSubmitting}
          size="field"
          class="!w-full px-3"
          kind="primary"
          type="submit"
        >
          Add
        </GenericButton>
      </FormGroup>
    </form>
  {/if}

  <div class="grid mt-8 md:grid-cols-2">
    {#each Object.entries(classification) as [key, stack] (stack)}
      <div class="w-full px-4 py-1" class:row-span-3={key === 'UNCLASSIFIED'}>
        <div class="flex items-center justify-between gap-4 p-1 border-b border-solid border-ctip-primary">
          <div class="text-base">
            {stack.title}
            {#if key === 'UNCLASSIFIED'}
              ({unclassifiedItems})
            {/if}
          </div>
          <div class="max-w-[200px] ml-auto">
            <Search size="sm" bind:value={classification[key].search} />
          </div>
          {#if key !== 'UNCLASSIFIED'}
            <TooltipIcon align="end" icon={InformationFilled}>
              <div slot="tooltipText" class="p-1">
                Set-up your hosts (external or internal) related to your employees sites to search in live botnets for
                account credentials from compromised computers used by your partners or external providers. e.g.
                <span class="text-ctip-primary">vpn.mydomain.com</span> ||
                <span class="text-ctip-primary">extranetportal.mydomain.com</span>
              </div>
            </TooltipIcon>
          {/if}
        </div>
        {#if loading}
          <SkeletonPlaceholder class="min-h-[200px] w-full" />
        {:else}
          <div
            role="region"
            aria-label="Drag and Drop Area"
            class="bg-ctip-ui dark:text-ctip-primary min-h-[200px] w-full flex flex-col gap-1 p-2.5 pb-5"
            class:drop-in-border={classificationHover === key && draggingInfo?.key !== key}
            on:dragenter={() => (classificationHover = key)}
            on:dragleave={() => (classificationHover = null)}
            on:drop={(event) => drop(event, key)}
            on:dragover={(e) => {
              classificationHover = key;
              e.preventDefault();
            }}
          >
            {#each stack.items as item, itemIndex (item)}
              {@const shown = item.value.toLowerCase().includes(classification[key].search.toLowerCase())}
              {@const dragging = draggingInfo?.key === key && draggingInfo?.itemIndex === itemIndex}
              {#if shown}
                <li
                  title={item.value}
                  class=" flex items-center justify-between w-full bg-white border-[1px] border-transparent border-solid hover:border-ctip-primary hover:cursor-move p-2.5 slide-in text-ellipsis overflow-hidden"
                  class:!opacity-50={dragging}
                  draggable={true}
                  on:dragstart={(event) => dragStart(event, key, itemIndex)}
                  on:dragend={() => (draggingInfo = null)}
                >
                  <span class="overflow-clip">
                    {item.value}
                  </span>
                  <Button
                    on:click={() => {
                      warningModalOpen = true;
                      deletingItem = item;
                      deletingItemkey = key;
                    }}
                    disabled={!!item.id}
                    class="rounded px-1.5 [&>svg]:ml-0"
                    size="small"
                    kind="danger-ghost"
                    icon={TrashCan}
                    iconDescription="Delete"
                    tooltipAlignment="end"
                  />
                </li>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
<WarningModal
  open={warningModalOpen}
  modalHeading="Confirmation"
  question="Are you sure you want to delete this?"
  secondMessage="This action cannot be undone."
  primaryButtonDisabled={loading}
  primaryButtonIcon={loading ? InlineLoading : null}
  on:submit={deleteClassification}
  on:closeModal={() => {
    warningModalOpen = false;
  }}
/>

<style>
  .slide-in {
    opacity: 0;
    transform: translateX(-50px);
    animation: slide 0.5s forwards;
  }
  @keyframes slide {
    100% {
      opacity: 100;
      transform: translateX(0);
    }
  }

  .drop-in-border {
    background-image: linear-gradient(90deg, silver 50%, transparent 50%),
      linear-gradient(90deg, silver 50%, transparent 50%), linear-gradient(0deg, silver 50%, transparent 50%),
      linear-gradient(0deg, silver 50%, transparent 50%);
    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    background-size: 15px 2px, 15px 2px, 2px 15px, 2px 15px;
    background-position: left top, right bottom, left bottom, right top;
    animation: border-dance 1s infinite linear;
  }
  @keyframes border-dance {
    0% {
      background-position: left top, right bottom, left bottom, right top;
    }
    100% {
      background-position: left 15px top, right 15px bottom, left bottom 15px, right top 15px;
    }
  }
</style>
