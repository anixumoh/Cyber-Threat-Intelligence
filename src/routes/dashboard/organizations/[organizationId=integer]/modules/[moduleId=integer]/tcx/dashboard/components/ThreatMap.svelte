<script lang="ts">
  export let columns = 1;
  export let rows = 1;
</script>

<!-- <iframe title="map" class="w-full" src="https://community.blueliv.com/map/" /> -->

<!-- <iframe
  id="map-canvas"
  class="overflow-hidden"
  width="100%"
  height="100%"
  style:min-height="{rows * 200}px"
  frameborder="0"
  scrolling="no"
  marginheight="0"
  marginwidth="0"
  src="https://maps.google.com/maps?width=100%&amp;height=600&amp;hl=en&amp;q=1%20Grafton%20Street,%20Dublin,%20Ireland+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
/>
 -->

<img class="w-full" src="/assets/map-v3-dummy/{columns}x{rows}.png" alt="Threat Map" />
