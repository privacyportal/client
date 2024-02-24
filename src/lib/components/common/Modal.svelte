<script>
  import { navigating } from '$app/stores';
  import { onDestroy } from 'svelte';

  export let padding = '1rem';
  export let minWidth = 'auto';
  export let maxWidth = '95vw';
  export let open = false;
  export let header = false;

  function handleExit() {
    if (open) {
      console.log('handleExit');
      open = false;
    }
  }

  const unsubscribeNavigation = navigating.subscribe(handleExit);

  onDestroy(unsubscribeNavigation);
</script>

{#if open}
  <div on:click|stopPropagation={handleExit} class="background" class:header>
    <div on:click|stopPropagation class="menu" style:--min-width={minWidth} style:--max-width={maxWidth} style:--padding={padding}>
      <slot />
    </div>
  </div>
{/if}

<style>
  .background {
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    z-index: 5000;
    top: 0px;
    left: 0px;
    height: 100vh;
    height: 100svh;
    width: 100vw;
    background-color: var(--modal-outer-bg-color);
  }

  .background.header {
    top: -50px;
    padding-top: 50px;
    height: calc(100vh + 50px);
    height: calc(100svh + 50px);
  }

  .menu {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow: hidden;
    max-height: 80vh;
    min-width: min(var(--min-width), 95vw);
    max-width: min(var(--max-width), 95vw);
    border-radius: 5px;
    padding: var(--padding);
    color: var(--text-color);
    background-color: var(--base-color);
  }

  @media screen and (max-width: 979px) {
    .background.header {
      top: 0px;
      padding-top: 0px;
      height: 100vh;
      height: 100svh;
    }
  }
</style>
