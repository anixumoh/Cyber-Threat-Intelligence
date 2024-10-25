<script lang="ts">
  import Client from '$lib/client';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { Modal, SkeletonPlaceholder, TextArea } from 'carbon-components-svelte';
  import { Checkmark, Close } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let name: string;

  const client = new Client();
  const dispatch = createEventDispatcher<{ edit: void }>();
</script>

<Modal
  bind:open
  size="sm"
  modalHeading="Plugin Detail"
  primaryButtonText="Edit"
  secondaryButtonText="Close"
  on:click:button--primary={() => dispatch('edit')}
  on:click:button--secondary={() => (open = false)}
>
  <div class="px-8">
    <div class="p-3 bg-ctip-hover-ui">Plugin Info</div>

    {#if name}
      {#await client.admin.getPlugin(name)}
        <SkeletonPlaceholder class="w-full h-72" />
        <SkeletonPlaceholder class="w-full h-80 mt-3" />
      {:then plugin}
        <div class="border">
          <div class="flex justify-between border p-2">
            <div>NAME</div>
            <div>
              {plugin.name}
            </div>
          </div>

          <div class="flex justify-between border p-2">
            <div>TYPE</div>
            <div>
              {plugin.type}
            </div>
          </div>

          <div class="flex justify-between border p-2">
            <div>LANGUAGE</div>
            <div>
              {plugin.language}
            </div>
          </div>

          <div class="flex justify-between border p-2">
            <div>MAP AND TRACK</div>
            <div>
              {#if plugin.enabled}
                <Checkmark class="fill-ctip-success" />
              {:else}
                <Close class="fill-ctip-danger" />
              {/if}
            </div>
          </div>

          <div class="flex justify-between border p-2">
            <div>INPUTS</div>
            <div>
              {plugin.inputs.join(', ')}
            </div>
          </div>

          <div class="flex justify-between border p-2">
            <div>OUTPUTS</div>
            <div>
              {plugin.outputs.join(', ')}
            </div>
          </div>

          <div class="flex justify-between border p-2">
            <div>UPDATED AT</div>
            <div>
              {getHumanReadableDate(plugin.updatedAt)}
            </div>
          </div>

          <div class="flex justify-between border p-2">
            <div>GLOBAL EXECUTION</div>
            <div>
              {#if plugin.globalExecution}
                <Checkmark class="fill-ctip-success" />
              {:else}
                <Close class="fill-ctip-danger" />
              {/if}
            </div>
          </div>
        </div>

        <div class="mt-3 p-3 bg-ctip-hover-ui">Content</div>

        <div class="border">
          <TextArea rows={10} readonly value={plugin.contentData} />
        </div>
      {/await}
    {/if}
  </div>
</Modal>
