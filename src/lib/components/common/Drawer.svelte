<script>
  import { navigating } from '$app/stores';
  import { onDestroy } from 'svelte';
  import Button from './Button.svelte';
  import CloseIcon from '../materialIcons/CloseIcon.svelte';

  export let open = false;
  export let mobile = false;
  export let right = false;
  export let heightSubstract = '0px';

  function handleExit() {
    if (open) {
      console.log('handleExit');
      open = false;
    }
  }

  const unsubscribeNavigation = navigating.subscribe(handleExit);

  onDestroy(unsubscribeNavigation);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click|stopPropagation={() => {}} class="drawer" class:mobile class:open class:right style:--height-sub={heightSubstract}>
  <div class="header">
    <slot name="header" />
    <Button on:click={handleExit} height="28px" padding="0px 2px" rounded>
      <CloseIcon dimension="30px" />
    </Button>
  </div>
  <slot />
</div>

<style>
  .drawer {
    --drawer-width: max(30vw, 300px);
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1000;
    top: 0px;
    height: calc(100vh - var(--height-sub));
    height: calc(100svh - var(--height-sub));
    width: var(--drawer-width);
    max-width: var(--drawer-width);
    background-color: var(--base-color);
    overflow: hidden;
    transition: 0.3s ease-in-out;
  }

  .drawer:not(.right) {
    left: 0px;
    margin-left: calc(-1 * var(--drawer-width));
    border-right: 2px solid var(--border-color);
  }

  .drawer.open:not(.right) {
    margin-left: 0px;
  }

  .drawer.right {
    right: 0px;
    margin-right: calc(-1 * var(--drawer-width));
    border-left: 2px solid var(--border-color);
  }

  .drawer.right.open {
    margin-right: 0px;
  }

  .header {
    height: 54px !important;
    min-height: 54px !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    box-shadow: inset 0 -1px 0 var(--border-color);
  }
</style>
