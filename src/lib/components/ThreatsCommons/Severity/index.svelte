<script lang="ts">
  export let severity = 0;
</script>

<div class="flex">
  <div class="border-0 px-[2px] py-1">
    <div
      class="rounded-full cursor-pointer w-[0.9375em] h-[0.9375em] bg-ctip-grayThreat"
      class:bg-ctip-severityYellow={severity === 1 || severity === 2}
    />
  </div>
  <div class="border-0 px-[2px] py-1">
    <div
      class="rounded-full cursor-pointer w-[0.9375em] h-[0.9375em] bg-ctip-grayThreat"
      class:bg-ctip-severityOrange={severity === 3 || severity === 4}
    />
  </div>
  <div class="border-0 px-[2px] py-1">
    <div
      class="rounded-full cursor-pointer w-[0.9375em] h-[0.9375em] bg-ctip-grayThreat"
      class:bg-ctip-dangerThreat={severity >= 5}
    />
  </div>
</div>
