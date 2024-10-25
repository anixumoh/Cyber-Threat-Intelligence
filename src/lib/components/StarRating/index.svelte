<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Star from './Star/index.svelte';

  const dispatch = createEventDispatcher<{ setRating: { rating: number; resourceId: number } }>();

  export let stars = 5;
  // User rating states
  export let rating = null;
  export let resourceId: number = undefined;
  let hoverRating = null;
  let arrayOfStars = [];

  $: if (stars) {
    for (let i = 0; i < stars; i++) {
      arrayOfStars = [...arrayOfStars, { id: i + 1, title: `${i + 1} Star${i > 0 ? 's' : ''}` }];
    }
  }
  // using curried function to initialize hover with id
  const onHover = (id: number) => () => {
    hoverRating = id;
  };

  const onRate = (id: number, event) => {
    event.stopImmediatePropagation();
    if (rating === id) {
      rating = null;
      dispatch('setRating', { rating: 0, resourceId });
      return;
    }
    rating = id;
    dispatch('setRating', { rating, resourceId });
  };
</script>

<div class="grid max-w-[120px] grid-flow-col cursor-pointer">
  {#each arrayOfStars as { id, title }}
    <Star
      {title}
      filled={hoverRating ? hoverRating >= id : rating >= id}
      fillAndStroke={rating >= 1}
      on:mouseover={resourceId && onHover(id)}
      on:mouseleave={() => resourceId && (hoverRating = null)}
      on:click={(event) => resourceId && onRate(id, event)}
    />
  {/each}
</div>
