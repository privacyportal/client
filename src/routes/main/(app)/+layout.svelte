<script>
  import '$lib/../app.css';
  import Header from '$lib/components/common/Header.svelte';
  import Login from '$lib/components/common/Login.svelte';
  import Snackbar from '$lib/components/common/Snackbar.svelte';
  import { isDarkBrowserColorScheme, isDarkMode, loadSession, session } from '$lib/stores/account';
  import { isPublicPage, noHeader } from '$lib/stores/nav';
  import { onMount } from 'svelte';

  let isSignedIn = false;

  $: isSignedIn = $session?.email && $session?.email_verified !== false;

  function detectBrowserColorScheme() {
    isDarkBrowserColorScheme.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  onMount(() => {
    detectBrowserColorScheme();
    loadSession();
  });
</script>

<Snackbar />

<svelte:head>
  {#if $isDarkMode}
    <style>
      body {
        background: var(--dark-mode-color) !important;
      }
    </style>
  {:else if $isPublicPage || !isSignedIn}
    <style>
      body {
        background: var(--primary-color) !important;
      }
    </style>
  {/if}
</svelte:head>

<div id="body" class:dark-mode={$isDarkMode}>
  {#if !$noHeader}
    <Header isLoginScreen={!isSignedIn} />
  {/if}

  <main class:no-header={$noHeader}>
    {#if $isPublicPage || isSignedIn}
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

  :global(main) {
    --header-height: 50px;
  }
  :global(main.no-header) {
    --header-height: 0px;
  }
</style>
