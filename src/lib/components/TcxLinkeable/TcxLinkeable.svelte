<script lang="ts">
  import { currentOrganization } from '$stores/organization';
  import { onMount } from 'svelte';
  import { modulesStore } from '$stores/module';
  import Client from '$lib/client';
  import { Button } from 'carbon-components-svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import modalTeleport from '$lib/actions/modalTeleport';
  import { Launch } from 'carbon-icons-svelte';

  export let value = undefined;
  export let checkForActors = false;
  export let isCreditCard = false;

  let id = null;
  let moduleId;
  let isDwLink = false;
  let actors = {};
  let actorsPromises = {};
  let tools = {};
  let toolsPromises = {};
  let showModal = false;
  let typeModule = '';
  const client = new Client();

  $: haslink = value && hasLinkFn();
  $: value && onInit();
  $: !value && reset();

  function onInit() {
    const threatContextModule = $modulesStore.find((item) => item.type === 'THREAT_CONTEXT');
    const darkWebModule = $modulesStore.find((item) => item.type === 'DARK_WEB');
    if (value) {
      const val = value.toLowerCase();
      let promise;
      if (isCreditCard) {
        if (val.startsWith('threatactor:')) {
          if (threatContextModule) {
            moduleId = threatContextModule.id;
          }

          isDwLink = false;
          promise = threatContextModule ? getActor(extractActorName(val)) : null;
        } else if (val.startsWith('pos ')) {
          if (threatContextModule) {
            moduleId = threatContextModule.id;
          }

          isDwLink = false;
          promise = threatContextModule ? getTool(extractToolName(val)) : null;
        } else if (
          val.includes('telegram') ||
          val.startsWith('irc:') ||
          val === 'hacktivism' ||
          val === 'marketplace' ||
          val === 'underground'
        ) {
          isDwLink = false;
        } else {
          if (darkWebModule) {
            moduleId = darkWebModule.id;
          }

          isDwLink = true;
        }
      } else {
        if (threatContextModule) {
          moduleId = threatContextModule.id;

          promise = val.startsWith('threatactor:')
            ? getActor(extractActorName(value))
            : getTool(extractToolName(value));
        } else {
          promise = null;
        }
      }

      if (promise) {
        promise.then((resId) => {
          if (resId) {
            id = resId;
          }
        });
      }
    }
  }

  onMount(() => {
    onInit();
    return () => {
      reset();
      client.abort();
    };
  });

  function reset() {
    id = null;
    moduleId = undefined;
    isDwLink = false;
    actors = {};
    actorsPromises = {};
    tools = {};
    toolsPromises = {};
    showModal = false;
    typeModule = '';
  }

  async function getTool(text: string, resource = 'tool') {
    if (!tools[text]) {
      if (!toolsPromises[text]) {
        const promise = new Promise(async (resolve, reject) => {
          const response = await client.actors.list({ dork: `name:~"${text}"` }, resource);

          if (response.data) {
            const { data } = response.data;
            const items = data.map(({ id, attributes }) => ({ id, ...attributes }));
            if (items?.length) {
              if (items.length === 1) {
                tools[text] = items[0].id;
              } else if (items.length > 1) {
                for (const item of items) {
                  if (item.name.toLowerCase() === text.toLowerCase()) {
                    tools[text] = item.id;
                    break;
                  }
                }
                if (tools[text] === 'undefined') {
                  for (const item of items) {
                    if (item.name.toLowerCase().startsWith(text.toLowerCase())) {
                      tools[text] = item.id;
                      break;
                    }
                  }
                }

                if (tools[text] === 'undefined') {
                  tools[text] = items[0].id;
                }
              }
            }
            resolve(tools[text]);
          }
        });
        toolsPromises[text] = promise;
      }
      return toolsPromises[text];
    }
    return Promise.resolve(tools[text]);
  }

  async function getActor(name: string) {
    if (!actors[name]) {
      if (!actorsPromises[name]) {
        const promise = new Promise(async (resolve, reject) => {
          const response = await client.actors.list({ dork: `name:~"${name}"` });

          if (response.data) {
            const items = response.data.map(({ id, attributes }) => ({ id, ...attributes }));
            if (items?.length) {
              if (items.length === 1) {
                actors[name] = items[0].id;
              } else if (items.length > 1) {
                for (const item of items) {
                  if (item.name.toLowerCase() === name.toLowerCase()) {
                    actors[name] = item.id;
                    break;
                  }
                }
                if (actors[name] === 'undefined') {
                  for (const item of items) {
                    if (item.name.toLowerCase().startsWith(name.toLowerCase())) {
                      actors[name] = item.id;
                      break;
                    }
                  }
                }

                if (actors[name] === 'undefined') {
                  actors[name] = items[0].id;
                }
              }
            }
            resolve(actors[name]);
          }
        });
        actorsPromises[name] = promise;
      }
      return actorsPromises[name];
    }
    return Promise.resolve(actors[name]);
  }

  function extractActorName(val: string) {
    return val.split('threatactor:')[1].replace('_', ' ');
  }

  function extractToolName(val: string) {
    if (isCreditCard) {
      return val.startsWith('pos ') ? val.split(' ')[1] : '';
    } else {
      return val;
    }
  }

  function hasLinkFn() {
    const val = value?.toLowerCase?.();
    if (!val || val === '-') {
      return false;
    }

    if (isCreditCard) {
      return val.startsWith('threatactor:') || val.startsWith('pos ');
    }
    return true;
  }

  function onShowModal(event, type) {
    event.preventDefault();
    if (!moduleId) {
      showModal = true;
      typeModule = type;
    }
  }

  function getRedirectToToolsLink() {
    if (id && moduleId) {
      let section = 'tools';
      if (checkForActors && value.toLowerCase().startsWith('threatactor:')) {
        section = 'actors';
      }
      return `/dashboard/organizations/${$currentOrganization.id}/modules/${moduleId}/threat_context/${section}/${id}`;
    }
    return '';
  }

  function getRedirectToDarkWeb() {
    const sw = value.replace(/(Telegram:|IRC:)/g, '');
    return `/dashboard/organizations/${$currentOrganization.id}/modules/${moduleId}/search?searchWord=${sw}`;
  }
</script>

<span>
  {#if (!isDwLink && !id && moduleId) || (!isDwLink && !moduleId && !haslink)}
    <span>{value}</span>
  {/if}
  {#if !isDwLink && !moduleId && haslink}
    <Button icon={Launch} size="small" kind="ghost" on:click={($event) => onShowModal($event, 'tcx')}>{value}</Button>
  {/if}
  {#if !isDwLink && id && moduleId}
    <Button href={getRedirectToToolsLink()} icon={Launch} size="small" kind="ghost">
      {value}
    </Button>
  {/if}
  {#if isDwLink && moduleId}
    <Button href={getRedirectToDarkWeb()} icon={Launch} size="small" kind="ghost">
      {value}
    </Button>
  {/if}
  {#if isDwLink && !moduleId}
    <Button on:click={($event) => onShowModal($event, 'dw')} icon={Launch} size="small" kind="ghost">
      {value}
    </Button>
  {/if}
</span>

<div use:modalTeleport>
  <WarningModal
    passiveModal
    bind:open={showModal}
    class="z-30"
    modalHeading="Information"
    primaryButtonText="Ok"
    secondaryButtonText="Cancel"
    question={`Unfortunately, the additional contextual information about this threat cannot be provided because the
  ${typeModule === 'tcx' ? 'Threat Context' : 'Dark Web'}
  module is not active in your organization.`}
    secondMessage={`If you are interested in how the ${
      typeModule === 'tcx' ? 'Threat Context' : 'Dark Web'
    } module could help you
with your investigations, please, contact: <a href="mailto:sales@blueliv.com" target="_blank">sales@blueliv.com</a>.`}
    on:submit={() => (showModal = false)}
    on:closeModal={() => (showModal = false)}
  />
</div>
