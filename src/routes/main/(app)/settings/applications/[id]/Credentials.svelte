<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import CopyIcon from '$lib/components/materialIcons/CopyIcon.svelte';
  import DeleteIcon from '$lib/components/materialIcons/DeleteIcon.svelte';
  import InfoIcon from '$lib/components/materialIcons/InfoIcon.svelte';
  import KeyIcon from '$lib/components/materialIcons/KeyIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { deleteOAuthClientSecret } from '$lib/modules/requests';
  import { formatDuration, writeValueToClipboard } from '$lib/modules/utils';
  import { minuteTimer } from '$lib/stores/timers';
  import ClientConfiguration from './ClientConfiguration.svelte';
  import NewClientSecret from './NewClientSecret.svelte';

  export let selected;
  export let loading;
  export let clientId;
  export let clientSecrets;

  let deleting = false;
  let clientIdCopied;
  let clientIdCopyTimeout;
  let newClientSecretModalOpened = false;
  let clientConfigurationModalOpened = false;

  const MAX_SECRETS = 10;

  async function copyClientIdToClipboard() {
    if (!clientIdCopied) {
      clearTimeout(clientIdCopyTimeout);
      writeValueToClipboard(clientId);
      clientIdCopied = true;
      clientIdCopyTimeout = setTimeout(() => {
        clientIdCopied = false;
      }, 3000);
    }
  }

  async function openGenerateClientSecretModal() {
    newClientSecretModalOpened = true;
  }

  function pushNewClientSecret(newSecret) {
    clientSecrets = [...(clientSecrets || []), newSecret];
  }

  async function deleteClientSecret(secretId) {
    deleting = true;
    try {
      await deleteOAuthClientSecret({ id: clientId, secretId });
      clientSecrets = clientSecrets.filter((s) => s.id !== secretId);
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      deleting = false;
    }
  }
</script>

<Modal bind:open={newClientSecretModalOpened} header minWidth="300px" maxWidth="500px">
  <NewClientSecret {clientId} {pushNewClientSecret} handleClose={() => (newClientSecretModalOpened = false)} />
</Modal>

<Modal bind:open={clientConfigurationModalOpened} header minWidth="300px" maxWidth="500px">
  <ClientConfiguration handleClose={() => (clientConfigurationModalOpened = false)} />
</Modal>

<FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale onlymobile alwaysDisplay={selected}>
  <FlexContainer align_items="center">
    <h4 class="no-margin oneline">Credentials</h4>
  </FlexContainer>

  <FlexContainer column gap="1rem">
    <FlexContainer column bgColor="var(--new-layer-color)" padding="0.5rem" rounded gap="0.5rem">
      <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
        <h5 class="no-margin">Client ID</h5>
        <Button
          height="25px"
          on:click={() => {
            clientConfigurationModalOpened = true;
          }}
          basic
          padding="0px 0.3rem"
          rounded
          border
        >
          <FlexContainer align_items="center" gap="0.3rem">
            <InfoIcon dimension="16px" />
            <span class="sm">Info</span>
          </FlexContainer>
        </Button>
      </FlexContainer>
      <Button on:click={copyClientIdToClipboard} basic padding="0px 0.5rem" rounded>
        <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
          <span class="oneline sm mono">{clientId || '-'}</span>
          {#if clientIdCopied}
            <span class="note">copied</span>
          {:else}
            <CopyIcon dimension="16px" />
          {/if}
        </FlexContainer>
      </Button>
    </FlexContainer>
    <FlexContainer column bgColor="var(--new-layer-color)" padding="0.5rem" rounded gap="0.5rem">
      <FlexContainer align_items="center" justify_content="space-between">
        <h5 class="no-margin">Client Secrets</h5>
        <Button on:click={openGenerateClientSecretModal} height="auto" padding="0.3rem 0.5rem" primary rounded disabled={loading || clientSecrets?.length >= MAX_SECRETS}
          ><small>Generate Secret</small></Button
        >
      </FlexContainer>
      <GridContainer margin="0 0 0 0" justify_items="stretch" template_columns="auto 1fr auto" align_items="center" gap="0.5rem 1rem">
        <div class="gridline"></div>
        {#if clientSecrets}
          {#each clientSecrets as clientSecret}
            <KeyIcon dimension="20px" />
            <FlexContainer column>
              <h5 class="no-margin">{clientSecret.value}</h5>
              <span class="sm">Added {formatDuration(clientSecret.created_at - $minuteTimer)}.</span>
            </FlexContainer>
            <Button on:click={() => deleteClientSecret(clientSecret.id)} padding="2px 7px" blendin rounded disabled={loading || deleting || clientSecrets?.length <= 1}>
              <DeleteIcon dimension="20px" disabled={loading || clientSecrets.length <= 1} />
            </Button>
            <div class="gridline"></div>
          {/each}
        {:else}
          <span class="sm">No clients secrets have been created yet.</span>
        {/if}
      </GridContainer>
    </FlexContainer>
  </FlexContainer>
</FlexContainer>

<style>
  span.note {
    font-size: x-small;
    filter: brightness(150%);
  }
</style>
