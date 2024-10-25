<script lang="ts">
  import { setColors } from '$lib/utils/functions';
  import { Tag } from 'carbon-components-svelte';

  let _label: any;
  export let label = undefined;
  export let labelProperty = undefined;
  export let customBg = undefined;
  export let filter = false;

  $: if (label) {
    _label = label;

    if ((label.background_color && !label.bgColorHex) || (label.bgColor && label.textColor)) {
      const background = label.background_color ? label.background_color : label.bgColor;
      const isWhite = background === 0xffffff ? 0xeeeeee : background;
      const colorObject = setColors(isWhite, 'rgb');

      _label.background = colorObject.background;
      _label.color = colorObject.color;
      _label.weight = colorObject.weight;
      _label.border = `3px solid ${colorObject.background}`;
    }
    if (!label.background_color && label.bgColorHex) {
      _label.background = label.bgColorHex;
      _label.color = label.textColorHex;
      _label.weight = '500';
      _label.border = `3px solid ${_label.background}`;
    }
    if (labelProperty) {
      _label.name = label[labelProperty];
    }
  }
</script>

<div style="--label-background-color: {customBg ?? _label.background}">
  <Tag
    on:close
    on:click
    {filter}
    type="outline"
    class="[&_span]:whitespace-nowrap [&_span]:text-ellipsis [&_span]:overflow-hidden"
  >
  <span title={_label.name || _label.label}>
    {_label.name || _label.label}
  </span>
  </Tag>
</div>

<style>
  div :global(.bx--tag--outline) {
    box-shadow: inset 0 0 0 3px var(--label-background-color);
    font-size: 10px;
    font-weight: bold;
    margin: 0.01rem;
  }
</style>
