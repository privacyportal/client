<script>
  import '$lib/../app.css';
  import Header from '$lib/components/common/Header.svelte';
  import Login from '$lib/components/common/Login.svelte';
  import Snackbar from '$lib/components/common/Snackbar.svelte';
  import { isDarkBrowserColorScheme, isDarkMode, loadSession, isSignedInUnlocked, isSignedInBasic, session, loadMasterKey } from '$lib/stores/account';
  import { navConfig } from '$lib/stores/nav';
  import { onDestroy, onMount } from 'svelte';

  function detectBrowserColorScheme() {
    isDarkBrowserColorScheme.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  const unsubscribeSession = session.subscribe(loadMasterKey);

  onMount(() => {
    detectBrowserColorScheme();
    loadSession();
  });

  onDestroy(unsubscribeSession);
</script>

<Snackbar />

<svelte:head>
  {#if $isDarkMode}
    <style>
      body {
        background: var(--dark-mode-color) !important;
      }
    </style>
  {:else if $navConfig.isPublicPage || !$isSignedInBasic}
    <style>
      body {
        background: var(--primary-color) !important;
      }
    </style>
  {/if}
</svelte:head>

<div id="body" class:dark-mode={$isDarkMode}>
  {#if !$navConfig.noHeader}
    <Header />
  {/if}

  <main class:no-header={$navConfig.noHeader} class:full-width={$navConfig.fullWidth}>
    {#if $navConfig.isPublicPage || $isSignedInUnlocked || ($isSignedInBasic && $navConfig.isE2EEBypassedPage)}
      <slot />
    {:else}
      <Login headerHeight="var(--header-height)" />
    {/if}
  </main>
</div>

<style>
  :global(.section:not(:first-child)) {
    box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.06);
  }

  :global(.clickable) {
    cursor: pointer;
  }

  :global(.no-margin) {
    margin: 0;
  }

  main {
    width: 100%;
    height: calc(100vh - var(--header-height));
    height: calc(100svh - var(--header-height));
    overflow-x: hidden;
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
    background-color: var(--base-color);
  }

  main.full-width {
    max-width: 100%;
  }

  :global(main) {
    --header-height: 50px;
  }
  :global(main.no-header) {
    --header-height: 0px;
  }
</style>
