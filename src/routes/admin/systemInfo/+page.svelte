<script lang="ts">
  import Client from '$lib/client';
  import { SkeletonPlaceholder, Tile } from 'carbon-components-svelte';
  const client = new Client();
</script>

<h2>System Info</h2>

<div class="grid gap-4 text-base">
  {#await client.admin.getSystemInfo()}
    <SkeletonPlaceholder class="w-full" />
    <SkeletonPlaceholder class="w-full h-96" />
  {:then systemInfo}
    <Tile>
      <div>
        <span class="font-bold">Max Memory:</span>
        <span>{systemInfo.maxMemory}</span>
      </div>
      <div>
        <span class="font-bold">Total Memory:</span>
        <span>{systemInfo.totalMemory}</span>
      </div>
      <div>
        <span class="font-bold">Free Memory:</span>
        <span>{systemInfo.freeMemory}</span>
      </div>
    </Tile>

    <Tile>
      <div>
        <span class="font-bold">OS Name:</span>
        <span>{systemInfo.osName}</span>
      </div>
      <div>
        <span class="font-bold">Available Processors:</span>
        <span>{systemInfo.availableProcessors}</span>
      </div>
      <div>
        <span class="font-bold">Disk Units:</span>

        <ul class="ml-2">
          {#each systemInfo.partitionsInfo as partition}
            <li>
              <span>{partition.fileSystem} ({partition.mounted}):</span>
              <span>{partition.used} of {partition.available}</span>
            </li>
          {/each}
        </ul>
      </div>
    </Tile>
  {/await}
</div>
