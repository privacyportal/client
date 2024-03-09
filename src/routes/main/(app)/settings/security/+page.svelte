<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import DeleteIcon from '$lib/components/materialIcons/DeleteIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { activateAuthenticator, deactivateAuthenticator, deleteApiKey, deleteAuthenticator, getApiKeys, getAuthenticators } from '$lib/modules/requests';
  import { formatDate, formatDuration } from '$lib/modules/utils';
  import { isEnhancedProtection } from '$lib/stores/account';
  import { onMount } from 'svelte';
  import AccountRecovery from './AccountRecovery.svelte';
  import NewApiKey from './NewApiKey.svelte';
  import NewAuthenticator from './NewAuthenticator.svelte';
  import { minuteTimer } from '$lib/stores/timers';

  const MAX_API_KEYS = 5;
  const MAX_AUTHENTICATORS = 10;

  let newAuthenticatorModalOpened = false;
  let newApiKeyModalOpened = false;
  let loadingAuthenticators = true;
  let loadingApiKeys = true;
  let authenticators = [];
  let apiKeys = [];
  let deletingApiKey;

  $: validApiKeys = (apiKeys || []).filter((apiKey) => apiKey.expires_at > $minuteTimer);

  async function fetchAuthenticators() {
    loadingAuthenticators = true;
    try {
      const res = await getAuthenticators();

      console.log(res.data);
      authenticators = res.data;
    } catch (err) {
      displayError(err);
    } finally {
      loadingAuthenticators = false;
    }
  }

  async function fetchApiKeys() {
    loadingApiKeys = true;
    try {
      const res = await getApiKeys();
      console.log(res.data);
      apiKeys = res.data;
    } catch (err) {
      displayError(err);
    } finally {
      loadingApiKeys = false;
    }
  }

  async function handleDeleteApiKey(key) {
    if (!confirm('Are you sure you want to delete this API Key?')) return;
    deletingApiKey = true;
    try {
      await deleteApiKey({ key });
      apiKeys = apiKeys.filter((apiKey) => apiKey.key !== key);
    } catch (err) {
      displayError(err);
    } finally {
      deletingApiKey = false;
    }
  }

  function pushNewApiKey(apiKey) {
    apiKeys = [...apiKeys, apiKey];
  }

  async function handleNewAuthenticator() {
    newAuthenticatorModalOpened = false;
    await fetchAuthenticators();
  }

  async function handleDeactivateAuthenticator(id) {
    try {
      await deactivateAuthenticator({ id });
      authenticators = authenticators.map((key) => (key.id === id ? Object.assign(key, { enabled: false }) : key));
    } catch (err) {
      displayError(err);
    }
  }

  async function handleActivateAuthenticator(id) {
    try {
      await activateAuthenticator({ id });
      authenticators = authenticators.map((key) => (key.id === id ? Object.assign(key, { enabled: true }) : key));
    } catch (err) {
      displayError(err);
    }
  }

  async function handleRemoveAuthenticator(id) {
    try {
      await deleteAuthenticator({ id });
      authenticators = authenticators.filter((key) => key.id !== id);
    } catch (err) {
      displayError(err);
    }
  }

  onMount(async () => {
    await fetchAuthenticators();
    if ($isEnhancedProtection) {
      await fetchApiKeys();
    }
  });
</script>

<Modal bind:open={newAuthenticatorModalOpened} header maxWidth="400px" padding="0px">
  <NewAuthenticator done={handleNewAuthenticator} cancel={() => (newAuthenticatorModalOpened = false)} />
</Modal>

<Modal bind:open={newApiKeyModalOpened} header minWidth="300px" maxWidth="400px" padding="0px">
  <NewApiKey {pushNewApiKey} handleClose={() => (newApiKeyModalOpened = false)} />
</Modal>

<FlexContainer column padding="1rem" align_items="flex-start" justify_content="flex-start" gap="1rem">
  <h1 class="no-margin">Security</h1>
  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <h4 class="no-margin">Authenticators</h4>
    <span class="sm">Adding additional authenticators allows you to sign in from multiple devices and prevents you from getting locked out of your account in the event of a device loss.</span>

    <FlexContainer mainList column gap="0px">
      <Button on:click={() => (newAuthenticatorModalOpened = true)} disabled={authenticators?.length >= MAX_AUTHENTICATORS} margin="0.5rem 0" primary rounded>New Authenticator</Button>
      {#if loadingAuthenticators}
        <p>loading...</p>
      {:else}
        <GridContainer align_items="center" template_columns="repeat(4, auto)" gap="0.5rem 1rem" margin="0.5rem 0 0 0">
          <h5 class="no-margin oneline">Name</h5>
          <h5 class="no-margin oneline">Last Used</h5>
          <h5 class="no-margin oneline text-centered">Enabled</h5>
          <h5 class="no-margin oneline text-centered">Delete</h5>
          {#each authenticators as authenticator}
            <span class="oneline mono sm">{authenticator.label}</span>
            <span class="mono sm">{formatDate(authenticator.last_used)}</span>
            <FlexContainer align_items="center" justify_content="center">
              <Toggle
                on:click={() => (authenticator.enabled ? handleDeactivateAuthenticator(authenticator.id) : handleActivateAuthenticator(authenticator.id))}
                size="12px"
                disabled={loadingAuthenticators}
                checked={authenticator.enabled}
              />
            </FlexContainer>
            <Button height="auto" margin="0" padding="0.2rem 0px" on:click={handleRemoveAuthenticator(authenticator.id)} disabled={authenticator.enabled} blendin rounded>
              <DeleteIcon dimension="18px" disabled={authenticator.enabled} />
            </Button>
          {/each}
        </GridContainer>
      {/if}
      <GridContainer template_columns="18px auto" align_items="center" margin="1.2rem 0 0.5rem 0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">We recommend registering a second authenticator to be used as a recovery mechanism in case of device loss.</span>
      </GridContainer>
    </FlexContainer>
  </FlexContainer>

  <AccountRecovery {loadingAuthenticators} {authenticators} />

  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <h4 class="no-margin">API Keys</h4>
    <span class="sm">Create API Keys to automate your flow by direclty using our API or through 3rd party applications.</span>
    <FlexContainer mainList column gap="0px">
      <Button on:click={() => (newApiKeyModalOpened = true)} disabled={validApiKeys?.length >= MAX_API_KEYS} margin="0.5rem 0" primary rounded>New API Key</Button>
      {#if loadingApiKeys}
        <p>loading...</p>
      {:else if validApiKeys?.length}
        <GridContainer align_items="center" template_columns="auto auto 1fr 1fr 30px" mobile_template_columns="minmax(auto, 1fr) auto 1fr 30px" gap="0.5rem 1rem" margin="0.5rem 0 0 0">
          <h5 class="no-margin oneline">Name</h5>
          <h5 class="no-margin oneline">Key ID</h5>
          <h5 class="no-margin oneline no-mobile">Created</h5>
          <h5 class="no-margin oneline">Expires In</h5>
          <br />
          {#each validApiKeys as apiKey}
            <span class="oneline mono sm">{apiKey.label}</span>
            <span class="oneline mono sm">{apiKey.key}</span>
            <span class="mono sm no-mobile">{formatDate(apiKey.created_at, { dateOnly: true })}</span>
            <span class="sm oneline">{formatDuration(apiKey.expires_at - $minuteTimer, { daysOnly: true })}</span>
            <Button on:click={() => handleDeleteApiKey(apiKey.key)} padding="0px 5px" margin="0px" align_items="center" blendin rounded disabled={loadingApiKeys || deletingApiKey}>
              <DeleteIcon dimension="20px" disabled={loadingApiKeys || deletingApiKey} />
            </Button>
          {/each}
        </GridContainer>
      {/if}
    </FlexContainer>
  </FlexContainer>
</FlexContainer>

<style>
  .text-centered {
    text-align: center;
  }
</style>
