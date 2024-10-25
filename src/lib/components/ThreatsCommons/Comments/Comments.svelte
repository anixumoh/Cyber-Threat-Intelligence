<script lang="ts">
  import Client from '$lib/client';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { SendAlt, Time, TrashCan } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';
  import { currentOrganization } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import threatsStore from '$stores/threats';
  import { page } from '$app/stores';
  import dayjs from 'dayjs';
  import { SkeletonText } from 'carbon-components-svelte';
  import notifications from '$stores/notification';

  const client = new Client();

  export let openCommentsModal = false;

  let comment = '';

  onMount(async () => {
    return () => {
      client.abort();
    };
  });

  function getAvatar(item: string) {
    return item[0].toUpperCase();
  }

  async function deleteComment(id: number) {
    $threatsStore.isLoading = true;
    try {
      const { data } = await client.comments.deleteComment(
        $currentOrganization.id,
        $currentModule.id,
        $currentModule.moduleName,
        $threatsStore.selectedForDetails?.resourceId,
        id
      );
      $threatsStore.comments = data;
    } catch (error) {
      notifications.notify({
        title: 'Error',
        subtitle: 'An error has occurred. Unable to delete comment.'
      });
    } finally {
      $threatsStore.isLoading = false;
    }
  }

  async function saveComment() {
    $threatsStore.isLoading = true;
    try {
      const { data } = await client.comments.saveComment(
        $currentOrganization.id,
        $currentModule.id,
        $currentModule.moduleName,
        $threatsStore.selectedForDetails?.resourceId,
        $page.url.pathname,
        comment
      );
      $threatsStore.comments = data;
      comment = '';
    } catch (error) {
      notifications.notify({
        title: 'Error',
        subtitle: 'An error has occurred. please try again later.'
      });
    }

    $threatsStore.isLoading = false;
  }
</script>

<CommonModal bind:open={openCommentsModal} passiveModal modalHeading="COMMENTS" on:closeModal>
  <div class="mt-3 mx-3 overflow-x-hidden">
    {#each $threatsStore.comments as { id, creationUsername, creation_user, creationDate, creation_date, content, comment }}
      {#if $threatsStore.isLoading}
        <SkeletonText />
      {:else}
        <div class="flex justify-center mx-0">
          <div class="w-11 h-11 bg-ctip-primary rounded-full flex justify-center items-center text-ctip-white mr-2">
            <span class="font-bold">{getAvatar(creationUsername || creation_user)}</span>
          </div>
          <div class="flex justify-between w-[555px] break-words">
            <span class="w-[479px]">
              <h5 class="text-ctip-dark mt-1 mb-0">{creationUsername || creation_user}</h5>
              <small class="flex items-center text-ctip-secondary mt-1">
                <Time class="mr-1" />
                <span>
                  {dayjs(creationDate || creation_date).format('MMM D, YYYY')}
                </span>
              </small>
              <p class="text-ctip-dark mt-2 w-[575px]">{content || comment}</p>
            </span>
            <span>
              <GenericButton on:click={() => deleteComment(id)} kind="danger-ghost">
                <TrashCan class="cursor-pointer" />
              </GenericButton>
            </span>
          </div>
        </div>
      {/if}
    {:else}
      <div class="flex justify-center">
        <span class="text-lg">No comments</span>
      </div>
    {/each}
  </div>
  <div class="bg-light p-3">
    <textarea class="w-full" rows="3" bind:value={comment} />

    <div class="w-full flex justify-end mt-2">
      <GenericButton on:click={saveComment} kind="primary" disabled={!comment}>
        <span class="hidden md:block"> Send </span>
        <SendAlt />
      </GenericButton>
    </div>
  </div>
</CommonModal>
