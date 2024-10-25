<script lang="ts">
  import threatsStore from '$stores/threats';
  import { CopyButton } from 'carbon-components-svelte';
  import ViewDetailsItem from '../ViewDetailsItem.svelte';

  import ExternalLink from '$lib/components/ThreatsCommons/ExternalLink/ExternalLink.svelte';
  import { Link } from 'carbon-icons-svelte';

  export let title = 'url';
  export let toCopy = $threatsStore.selectedForDetails.originalUrl;
  export let text = $threatsStore.selectedForDetails.url;
  export let icon = Link;
  export let width = undefined;
  export let tooltipText = '';
</script>

<ViewDetailsItem {title} {icon} action {tooltipText}>
  <svelte:fragment slot="action">
    <div class="flex text-left">
      <CopyButton text={toCopy} />
      <ExternalLink {text} tooltipText={toCopy} onlyText {width} />
    </div>
  </svelte:fragment>
</ViewDetailsItem>
