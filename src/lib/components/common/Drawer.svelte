<script>
  import { navigating } from '$app/stores';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { logoColor } from '$lib/stores/nav';
  import { onDestroy } from 'svelte';

  export let open = false;

  function handleExit() {
    if (open) {
      console.log('handleExit');
      open = false;
    }
  }

  const unsubscribeNavigation = navigating.subscribe(handleExit);

  onDestroy(unsubscribeNavigation);
</script>

<div class="drawer mobile" class:open>
  <div class="header">
    <div class="brand">
      <Logo dimension="34" color={$logoColor} opacity={'1'} />
      <span class="brand-name no-wrap">Privacy Portal</span>
    </div>
    <Button on:click={handleExit} height="28px" margin="0px -0.25rem 0px 0px" padding="0px 2px" rounded>
      <CloseIcon dimension="30px" />
    </Button>
  </div>
  <FlexContainer column height="100%" padding="1rem" bgColor="var(--new-layer-color)" nooverflow>
    <slot />
  </FlexContainer>
</div>

<style>
  .drawer {
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 10000;
    top: 0x;
    left: 0px;
    height: 100vh;
    height: 100svh;
    width: 100vw;
    margin-left: -100vw;
    background-color: var(--base-color);
    border-right: 2px solid var(--border-color);
    overflow: hidden;
    transition: 0.3s ease;
  }

  .open {
    margin-left: 0px;
    transition: 0.4s ease-in-out;
  }

  .header {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    box-shadow: inset 0 -1px 0 var(--border-color);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .brand-name {
    color: var(--text-color);
    font-weight: 400;
    font-size: 1.17rem;
    letter-spacing: 0px;
  }
</style>
