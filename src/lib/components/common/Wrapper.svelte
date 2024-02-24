<script>
  export let zindex = 'auto';
  export let position = 'auto';
  export let center = false;
  export let wide = false;
</script>

<div class="wrapper" style:--position={position} style:--z-index={zindex} class:center class:wide>
  <slot />
</div>

<style>
  .wrapper {
    width: 100%;
    max-width: min(95%, 600px);
    position: var(--position);
    z-index: var(--z-index);
  }

  .wide {
    max-width: min(95%, 800px);
  }

  .center {
    align-self: center;
  }
</style>
