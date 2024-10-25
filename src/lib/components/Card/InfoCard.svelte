<script lang="ts">
  export let title = '';
  export let withBorderBottom = true;
  export { className as class };

  let className = '';
</script>

<div
  class="border bg-ctip-ui text-ctip-text rounded-t-md p-2 flex justify-between w-full {className}"
>
  <div class="flex flex-col w-full">
    <div class="flex justify-between">
      <div class="flex items-center">
        <span class="font-bold">{title}</span>
        <slot name="action-left" />
      </div>
      <div class="flex items-center"><slot name="action" /></div>
    </div>
    <div class="flex justify-end">
      <slot name="user-action" />
    </div>
  </div>
</div>
<div
  class="border-l border-b border-r border-ctip-border text-ctip-text bg-ctip-background border-solid flex justify-between w-full min-h-min"
  class:rounded-b-md={withBorderBottom}
>
  <slot />
</div>
