<script lang="ts">
  import menuExpandedStore from '$stores/menuExpanded';
</script>

<div
  class="transition-all mt-4 px-6"
  class:ml-64={$menuExpandedStore}
  class:ml-20={!$menuExpandedStore}
>
  <slot />
</div>
