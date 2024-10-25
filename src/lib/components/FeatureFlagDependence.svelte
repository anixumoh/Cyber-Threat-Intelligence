<script lang="ts">
  import { isFeatureFlagEnabled } from '$lib/client/services/featureFlagsService';
  import type { FeatureFlags } from '$lib/dataSources/featureFlagsSource';
  import { onMount } from 'svelte';

  let isFeatureEnabled = false;
  export let featureName: keyof FeatureFlags;
  onMount(async () => {
    isFeatureEnabled = await isFeatureFlagEnabled(featureName);
  });
</script>

{#if isFeatureEnabled}
  <div>
    <slot />
  </div>
{/if}
