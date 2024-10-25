<script lang="ts">
  import { page } from '$app/stores';
  import Client from '$lib/client';
  import type { Actor, ActorData, Country, TargetItem } from '$lib/client/services/actors';
  import CollapsableItems from '$lib/components/CollapsableItems/CollapsableItems.svelte';
  import Tlp from '$lib/components/Tlp/index.svelte';
  import externalLinkStore from '$stores/externalLink';
  import notifications from '$stores/notification';
  import { Accordion, AccordionItem, SkeletonPlaceholder, Tag } from 'carbon-components-svelte';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import breadcrumbs from '../../breadcrumbs';
  import GlobalSearchGraphs from '../../global-search/GlobalSearchGraphs.svelte';
  import ActorTargetsTab from './ActorTargetsTab.svelte';
  import ActorTableTabs from './ActorTableTabs.svelte';

  const client = new Client();

  let actorData: ActorData;
  let actor: Actor;
  let targets: TargetItem[];
  let country: Country;

  onMount(() => {
    loadActor();
    return () => client.abort();
  });

  async function loadActor() {
    try {
      actorData = await client.actors.getActor(+$page.params.actorId);
      actor = {
        id: actorData.id,
        ...actorData.attributes,
        relationships: actorData.relationships
      };
      const [_country, _targets] = await Promise.all([getCountry(actorData), getActorTarget(+$page.params.actorId)]);
      country = _country;
      targets = _targets;
      breadcrumbs.add(`Actor: ${actorData.attributes.name}`, `/actor/${$page.params.actorId}`);
    } catch (error) {
      return notifications.notify({
        title: 'Error',
        subtitle: 'Some error has ocurred getting actor data'
      });
    }
  }

  async function getCountry(actor: ActorData) {
    const countryId = actor?.relationships?.country?.data?.id;
    if (countryId) {
      return await client.actors.getCountry(countryId);
    }
  }

  async function getActorTarget(actorId: number) {
    return await client.actors.getActorTarget(+$page.params.actorId);
  }

  function formatDate(value: string) {
    try {
      return dayjs(value).format('D/M/YYYY');
    } catch (error) {
      return '-';
    }
  }
</script>

<h4>Actor</h4>

{#if !actorData}
  <SkeletonPlaceholder class="w-full h-96" />
{:else}
  <div class="grid gap-4">
    <!-- TITLE -->
    <section class="flex items-center w-full gap-4 p-2 bg-ctip-ui">
      <img class="h-6" src="/assets/img/threat_actor.png" alt="Target" />
      <div class="text-lg font-bold">{actorData.attributes.name}</div>
    </section>

    <!-- INFO -->
    <div class="grid gap-4 lg:grid-cols-3">
      <section class="grid p-2 lg:col-span-2 md:grid-cols-2 bg-ctip-ui">
        <article class="grid grid-cols-[auto_1fr] gap-2 items-center">
          <div>Aliases</div>
          <CollapsableItems items={actorData.attributes.aliases} let:item>
            <Tag size="sm">
              <div class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={String(item)}>
                {item}
              </div>
            </Tag>
          </CollapsableItems>

          <div>Origin</div>
          <div>
            <Tag type="blue">{actorData.attributes.country_name || '-'}</Tag>
          </div>

          <div>First seen</div>
          <div>
            <Tag type="blue">{formatDate(actorData.attributes.first_seen)}</Tag>
          </div>

          <div>Last seen</div>
          <div>
            <Tag type="blue">{formatDate(actorData.attributes.last_seen)}</Tag>
          </div>
        </article>

        <article class="grid grid-cols-[auto_1fr] gap-2 items-center">
          <div>TLP</div>
          <div class="flex justify-start px-1">
            <Tlp readonly status={actorData.attributes.tlp.toUpperCase()} />
          </div>

          <div>Status</div>
          <div>
            <Tag type={actorData.attributes.active ? 'green' : 'red'}>
              {actorData.attributes.active ? 'Active' : 'Inactive'}
            </Tag>
          </div>

          <div>Type</div>
          <CollapsableItems items={actorData.attributes.types} let:item>
            <Tag size="sm">
              <div class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={String(item)}>
                {item}
              </div>
            </Tag>
          </CollapsableItems>

          <div>Sophistication</div>
          <div><Tag type="blue">{actorData.attributes.sophistication}</Tag></div>
        </article>
      </section>

      <section class="p-2 bg-ctip-ui">
        <article class="grid md:grid-cols-2">
          <div class="grid text-center">
            <div class="font-bold">Country</div>
            <CollapsableItems
              rowsToShow={4}
              items={targets?.filter((target) => target.attributes.category === 'countries') ?? []}
              let:item
            >
              <Tag size="sm">
                <div
                  class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
                  title={String(item.attributes.display_name)}
                >
                  {item.attributes.display_name}
                </div>
              </Tag>
            </CollapsableItems>
          </div>

          <div class="grid text-center">
            <div class="font-bold">Region</div>
            <CollapsableItems
              rowsToShow={4}
              items={targets?.filter((target) => target.attributes.category === 'regions') ?? []}
              let:item
            >
              <Tag size="sm">
                <div
                  class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
                  title={String(item.attributes.display_name)}
                >
                  {item.attributes.display_name}
                </div>
              </Tag>
            </CollapsableItems>
          </div>
        </article>
      </section>
    </div>

    <!-- MAP TABS -->
    <section>
      {#if targets}
        <ActorTargetsTab actor={actorData} {targets} {country} />
      {:else}
        <SkeletonPlaceholder class="w-full h-[500px]" />
      {/if}
    </section>

    <!-- DESCRIPTION -->
    <section>
      <Accordion>
        <AccordionItem class="[&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui" open>
          <span slot="title" class="text-2xl font-bold">Description</span>
          <div class="px-4 raw-html">
            {@html actorData.attributes.description}
          </div>
        </AccordionItem>
        <AccordionItem class="[&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
          <span slot="title" class="text-2xl font-bold">Objective</span>
          <div class="px-4 raw-html">
            {@html actorData.attributes.objective}
          </div>
        </AccordionItem>
        <AccordionItem class="[&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
          <span slot="title" class="text-2xl font-bold">Modus Operandi</span>
          <div class="px-4 raw-html">
            {@html actorData.attributes.modus_operandi}
          </div>
        </AccordionItem>
        <AccordionItem class="[&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
          <span slot="title" class="text-2xl font-bold">References</span>
          <div class="grid px-4">
            {#each actorData.attributes.references as reference}
              <a
                on:click={externalLinkStore.handleClick}
                href={reference.link}
                target="_blank"
                rel="noreferrer noopener"
              >
                {reference.title}
              </a>
            {/each}
          </div>
        </AccordionItem>
      </Accordion>
    </section>

    <!-- GRAPH -->
    <section>
      <GlobalSearchGraphs actors={[actor]} />
    </section>

    <!-- TABLES -->
    <section class="mb-52">
      <ActorTableTabs actor={actorData} />
    </section>
  </div>
{/if}

<style>
  :global(.raw-html ul) {
    list-style-type: disc;
    margin-left: 20px;
  }
  :global(.raw-html ul ul) {
    list-style-type: circle;
  }
  :global(.raw-html ul ul ul) {
    list-style-type: square;
  }
  :global(.raw-html h5) {
    padding-top: 20px;
  }
</style>
