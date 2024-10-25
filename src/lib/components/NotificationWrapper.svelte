<script lang="ts">
  import notifications from '$stores/notification';
  import { InlineNotification } from 'carbon-components-svelte';

  function onClose(id: string) {
    notifications.update((notifications) => notifications.filter((notification) => notification.id !== id));
  }
</script>

<div class="fixed top-10 right-4 z-[10000] max-w-xs">
  {#each $notifications as { id, link, ...notification } (id)}
    <InlineNotification data-test="notification" on:close={() => onClose(id)} {...notification}>
      {#if link}
        <a
          on:click={() => {
            if (!link.keep) onClose(id);
          }}
          href={link.href}
        >
          {link.title}
        </a>
      {/if}
    </InlineNotification>
  {/each}
</div>
