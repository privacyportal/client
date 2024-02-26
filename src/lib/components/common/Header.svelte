<script context="module">
  let actionHandler = () => console.log('action button pressed');

  export function setNavActionHandler(handler) {
    actionHandler = handler;
  }
</script>

<script>
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import ShareIcon from '$lib/components/materialIcons/ShareIcon.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Drawer from '$lib/components/common/Drawer.svelte';
  import Dropdown from '$lib/components/common/Dropdown.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Tag from '$lib/components/common/Tag.svelte';
  import AppsIcon from '$lib/components/materialIcons/AppsIcon.svelte';
  import BackIcon from '$lib/components/materialIcons/BackIcon.svelte';
  import Burger from '$lib/components/svg/Burger.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import PersonIcon from '$lib/components/materialIcons/PersonIcon.svelte';
  import { LANDING_CLIENT_URL } from '$lib/modules/constants';
  import { gotoExt, gotoPage } from '$lib/modules/routingUtils';
  import { endSession, isDarkMode, isEnhancedProtection, session } from '$lib/stores/account';
  import { logoColor, navBackButton } from '$lib/stores/nav';
  import { getContext, setContext } from 'svelte';

  export let isLoginScreen = false;

  let accountModalOpened;
  let appsModalOpened;
  let installInstructionsModalOpened;
  let drawerOpened;
  let isOffline = false;
  let canInstallApp = false;
  let deferredInstallPrompt;

  setContext('nav-button-action', {
    handleNavButtonAction: () => {
      actionHandler();
    }
  });

  const { handleNavButtonAction } = getContext('nav-button-action');

  function closeOnExit(next) {
    return () => {
      if (drawerOpened) drawerOpened = false;
      if (accountModalOpened) accountModalOpened = false;
      if (appsModalOpened) appsModalOpened = false;
      if (installInstructionsModalOpened) installInstructionsModalOpened = false;
      next();
    };
  }

  async function handleAppInstall() {
    if (deferredInstallPrompt) {
      // Show the install prompt
      deferredInstallPrompt.prompt();
      // wait for the user choice
      await deferredInstallPrompt.userChoice;
      // install prompt can only be called once
      deferredInstallPrompt = undefined;
      canInstallApp = false;
    }
  }

  $: emailLocalPart = $session?.email?.split('@')?.[0] || '';
</script>

<svelte:window
  on:offline={() => (isOffline = true)}
  on:onLine={() => (isOffline = false)}
  on:beforeinstallprompt|preventDefault={(e) => {
    deferredInstallPrompt = e;
    canInstallApp = true;
  }}
  on:appinstalled={() => {
    canInstallApp = false;
  }}
/>

<header class:login-screen={isLoginScreen} class:dark-mode={$isDarkMode}>
  <Modal bind:open={accountModalOpened} minWidth="250px">
    <h5 class="no-margin oneline">{emailLocalPart}</h5>
    <p class="no-margin oneline">{$session?.email}</p>
    <div>
      {#if $isEnhancedProtection}
        <Tag backgroundColor="var(--positive-color)">Enhanced Protection</Tag>
      {:else}
        <Tag backgroundColor="var(--warning-color)">Basic Protection</Tag>
      {/if}
    </div>
    <hr class="divider" />
    <FlexContainer column gap="0.5rem">
      {#if $session?.email_verified !== false}
        <FlexContainer column rounded overflowhidden gap="1px">
          <Button on:click={gotoPage('/account')} basic>Account</Button>
          <Button on:click={gotoPage('/settings/security')} basic>Security</Button>
          <Button on:click={gotoPage('/support')} basic>Get Help</Button>
        </FlexContainer>
      {/if}
      <Button on:click={closeOnExit(endSession)} primary rounded>Sign Out</Button>
    </FlexContainer>
  </Modal>
  <Modal bind:open={appsModalOpened} minWidth="250px">
    <FlexContainer column gap="1.5rem">
      <FlexContainer column gap="0.5rem">
        <h5 class="no-margin">Mail Relay</h5>
        <FlexContainer column rounded overflowhidden gap="1px">
          <Button on:click={gotoPage('/mail-relay')} basic>Mail Relay App</Button>
          <Button on:click={gotoPage('/mail-relay/settings')} basic>Relay Settings</Button>
        </FlexContainer>
      </FlexContainer>
      <FlexContainer column gap="0.5rem">
        <h5 class="no-margin">Sign In with Privacy Portal</h5>
        <FlexContainer column rounded overflowhidden gap="1px">
          <Button on:click={gotoPage('/settings/applications')} basic>Authorized Apps</Button>
          <Button on:click={gotoPage('/settings/developers')} basic>Developer Settings</Button>
        </FlexContainer>
      </FlexContainer>
    </FlexContainer>
  </Modal>
  <Modal bind:open={installInstructionsModalOpened} minWidth="250px">
    <FlexContainer align_items="center" justify_content="space-between" padding="0 0 1rem 0">
      <h4 class="no-margin">Install App (on iOS)</h4>
      <Button height="auto" on:click={() => (installInstructionsModalOpened = false)} blendin rounded>
        <CloseIcon dimension="25px" />
      </Button>
    </FlexContainer>
    <span class="sm">Get the full experience by installing the Privacy Portal app in two easy steps:</span>
    <ol>
      <li>
        <FlexContainer align_items="center" gap="0.5rem">
          <span>Tap on the browser Share button.</span>
          <ShareIcon dimension="18px" />
        </FlexContainer>
      </li>
      <li>
        <span>Then select "Add to Home Screen".</span>
      </li>
    </ol>
  </Modal>
  <Drawer bind:open={drawerOpened}>
    {#if $session?.email && $session?.email_verified !== false}
      <FlexContainer column height="calc(100vh - 50px - 2rem)" padding="0 0 0.5rem 0" justify_content="space-between">
        <FlexContainer column gap="1.5rem">
          <FlexContainer column gap="0.5rem">
            <h4 class="no-margin">Main Account</h4>
            <FlexContainer column rounded border overflowhidden zeroFlexShrink gap="2px">
              <Button on:click={closeOnExit(gotoPage('/account'))} flexgrow ascolumn align_items="flex-start">Account</Button>
              <Button on:click={closeOnExit(gotoPage('/settings/security'))} flexgrow ascolumn align_items="flex-start">Security</Button>
              <Button on:click={closeOnExit(gotoPage('/support'))} flexgrow ascolumn align_items="flex-start">Get Help</Button>
            </FlexContainer>
          </FlexContainer>

          <FlexContainer column gap="0.5rem" padding="0 0 0 0rem">
            <h5 class="no-margin">Mail Relay</h5>
            <FlexContainer column rounded border overflowhidden zeroFlexShrink gap="2px">
              <Button on:click={closeOnExit(gotoPage('/mail-relay'))} flexgrow ascolumn align_items="flex-start">Mail Relay App</Button>
              <Button on:click={closeOnExit(gotoPage('/mail-relay/settings'))} flexgrow ascolumn align_items="flex-start">Relay Settings</Button>
            </FlexContainer>
          </FlexContainer>

          <FlexContainer column gap="0.5rem" padding="0 0 0 0rem">
            <h5 class="no-margin">Sign In with Privacy Portal</h5>
            <FlexContainer column rounded border overflowhidden zeroFlexShrink gap="2px">
              <Button on:click={closeOnExit(gotoPage('/settings/applications'))} flexgrow ascolumn align_items="flex-start">Authorized Apps</Button>
              <Button on:click={closeOnExit(gotoPage('/settings/developers'))} flexgrow ascolumn align_items="flex-start">Developer Settings</Button>
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>
        <FlexContainer column>
          <Button on:click={closeOnExit(endSession)} flexgrow primary rounded>Sign Out</Button>
        </FlexContainer>
      </FlexContainer>
    {:else}
      <h3>Links</h3>
      <FlexContainer column rounded border overflowhidden zeroFlexShrink gap="2px">
        <Button on:click={closeOnExit(gotoExt(`${LANDING_CLIENT_URL}`))} flexgrow ascolumn align_items="flex-start">Home</Button>
        <Button on:click={closeOnExit(gotoExt(`${LANDING_CLIENT_URL}/support`))} flexgrow ascolumn align_items="flex-start">Support</Button>
        <Button on:click={closeOnExit(gotoExt(`${LANDING_CLIENT_URL}/blog`))} flexgrow ascolumn align_items="flex-start">Blog</Button>
        <Button on:click={closeOnExit(gotoExt(`${LANDING_CLIENT_URL}/privacy`))} flexgrow ascolumn align_items="flex-start">Privacy Policy</Button>
      </FlexContainer>
      {#if canInstallApp && deferredInstallPrompt}
        <br />
        <FlexContainer column>
          <Button on:click={handleAppInstall} flexgrow primary light border rounded>Install App</Button>
        </FlexContainer>
      {/if}
      {#if $session?.email}
        <br />
        <FlexContainer column>
          <Button on:click={closeOnExit(endSession)} flexgrow primary rounded>Sign Out</Button>
        </FlexContainer>
      {/if}
    {/if}
  </Drawer>
  <div class="wrapper">
    <nav>
      <div class="nav-section mobile">
        <!-- used only on mobile -->
        {#if $navBackButton}
          <Button on:click={handleNavButtonAction} margin="0px 0px 0px -4px" padding="0px"><BackIcon /></Button>
        {:else}
          <Button on:click={() => (drawerOpened = true)} margin="0px" padding="0px 2px" blendin rounded>
            <Burger color={$isDarkMode ? 'var(--text-color)' : $logoColor} />
          </Button>
        {/if}
      </div>
      <a class="nav-section" href="/" rel="home">
        <Logo dimension="34" color={isOffline ? 'var(--disabled-color)' : $logoColor} opacity={'1'} />
        <span class="brand-name no-wrap no-mobile">Privacy Portal</span>
      </a>
      <div class="nav-section">
        {#if isLoginScreen}
          <FlexContainer width="100%" align_items="center" justify_content="flex-end" nomobile gap="1rem">
            <a href={`${LANDING_CLIENT_URL}`}><span>Home</span></a>
            <a href={`${LANDING_CLIENT_URL}/support`}><span>Support</span></a>
            <a href={`${LANDING_CLIENT_URL}/blog`}><span>Blog</span></a>
            <a href={`${LANDING_CLIENT_URL}/privacy`}><span>Privacy</span></a>
            {#if canInstallApp && deferredInstallPrompt}
              <Button on:click={handleAppInstall} width="auto" height="auto" padding="0.2rem 0.3rem" primary light border rounded>
                <span class="sm">Install App</span>
              </Button>
            {:else}
              <Button on:click={() => (installInstructionsModalOpened = true)} globalClass={['ios-browser']} width="auto" height="auto" padding="0.2rem 0.3rem" primary light border rounded>
                <span class="sm">Install App</span>
              </Button>
            {/if}
          </FlexContainer>

          {#if canInstallApp && deferredInstallPrompt}
            <FlexContainer width="100%" align_items="center" justify_content="flex-end" onlymobile>
              <Button on:click={handleAppInstall} height="auto" padding="0.2rem 0" flexgrow primary light border rounded>
                <span class="sm">Install App</span>
              </Button>
            </FlexContainer>
          {:else}
            <FlexContainer width="100%" align_items="center" justify_content="flex-end" onlymobile>
              <Button on:click={() => (installInstructionsModalOpened = true)} globalClass={['ios-browser']} height="auto" padding="0.2rem 0" flexgrow primary light border rounded>
                <span class="sm">Install App</span>
              </Button>
            </FlexContainer>
          {/if}
        {:else}
          <div class="menu-group no-mobile" />
        {/if}
        <div class="menu-group">
          {#if $session?.email}
            <Button on:click={() => (appsModalOpened = true)} height="28px" margin="0px" padding="0" border rounded mobile>
              <AppsIcon dimension="24px" />
            </Button>
            <Button on:click={() => (accountModalOpened = true)} height="28px" margin="0px" padding="0" border rounded mobile>
              <PersonIcon dimension="24px" />
            </Button>
            <Dropdown height="34px" noMobile>
              <AppsIcon dimension="24px" slot="title" />
              <FlexContainer column gap="1.5rem">
                <FlexContainer column gap="0.5rem">
                  <h4 class="no-margin">Mail Relay</h4>
                  <FlexContainer column rounded overflowhidden gap="1px">
                    <Button on:click={gotoPage('/mail-relay')} basic>Application</Button>
                    <Button on:click={gotoPage('/mail-relay/settings')} basic>Relay Settings</Button>
                  </FlexContainer>
                </FlexContainer>
                <FlexContainer column gap="0.5rem">
                  <h4 class="no-margin">Sign In with Privacy Portal</h4>
                  <FlexContainer column rounded overflowhidden gap="1px">
                    <Button on:click={gotoPage('/settings/applications')} basic>Authorized Apps</Button>
                    <Button on:click={gotoPage('/settings/developers')} basic>Developer Settings</Button>
                  </FlexContainer>
                </FlexContainer>
              </FlexContainer>
            </Dropdown>
            <Dropdown height="34px" noMobile>
              <PersonIcon dimension="24px" slot="title" />
              <h5 class="no-margin oneline">{emailLocalPart}</h5>
              <p class="no-margin oneline">{$session?.email}</p>
              <div>
                {#if $isEnhancedProtection}
                  <Tag backgroundColor="var(--positive-color)">Enhanced Protection</Tag>
                {:else}
                  <Tag backgroundColor="var(--warning-color)">Basic Protection</Tag>
                {/if}
              </div>
              <hr class="divider" />
              {#if $session?.email_verified !== false}
                <FlexContainer column gap="0.5rem">
                  <FlexContainer column rounded overflowhidden gap="1px">
                    <Button on:click={gotoPage('/account')} basic>Account</Button>
                    <Button on:click={gotoPage('/settings/security')} basic>Security</Button>
                    <Button on:click={gotoPage('/support')} basic>Get Help</Button>
                  </FlexContainer>
                  <Button on:click={endSession} primary rounded>Sign Out</Button>
                </FlexContainer>
              {/if}
            </Dropdown>
          {/if}
        </div>
      </div>
    </nav>
  </div>
</header>

<style>
  header {
    width: 100%;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  header > .wrapper {
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
    background-color: var(--base-color);
    box-shadow: inset 0 -1px 0 var(--base-border-color);
  }

  header.login-screen > .wrapper {
    max-width: 100%;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  nav {
    height: 50px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    width: 100%;
    display: grid;
    grid-template-columns: 0px 20% 80%;
    justify-items: start;
  }

  nav > .nav-section:last-child {
    justify-self: stretch;
    justify-content: space-between;
    grid-column: 3;
  }

  .nav-section {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .menu-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  header .brand-name {
    font-weight: 400;
    font-size: 1.17rem;
    letter-spacing: 0px;
  }

  header a {
    color: var(--text-color);
  }

  a:hover {
    text-decoration: none;
  }

  ol {
    font-size: small;
    line-height: 200%;
  }

  @media screen and (max-width: 979px) {
    nav {
      grid-template-columns: 40% 20% 40%;
    }

    nav > .nav-section:nth-child(2):not(:last-child) {
      grid-column: 2;
      justify-self: center;
    }

    nav > .nav-section:last-child {
      justify-self: end;
    }
  }
</style>
