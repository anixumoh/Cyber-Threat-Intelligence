<script lang="ts">
  import { Bookmark, BookmarkFilled } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';
  import TooltipWithIcon from '$lib/components/TooltipWithIcon/TooltipWithIcon.svelte';
  import { COLORS } from '$lib/constants/colors';
  import darkMode from '$stores/darkMode';

  const { primary, lightBlue } = COLORS;
  const dispatch = createEventDispatcher<{ setFavorite: { isFavorite: boolean } }>();

  export let isFavorite = true;

  async function onMarkAsFav(event) {
    event.stopImmediatePropagation();
    isFavorite = !isFavorite;
    dispatch('setFavorite', { isFavorite });
  }
</script>

<TooltipWithIcon
  tooltipText={isFavorite ? 'Mark as favorite' : 'Unmark as favorite'}
  color={isFavorite ? '' : $darkMode ? lightBlue : primary}
  icon={isFavorite ? Bookmark : BookmarkFilled}
  on:click={(event) => onMarkAsFav(event)}
  data-test="favorite-button"
/>
