<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import CopyIcon from '$lib/components/materialIcons/CopyIcon.svelte';
  import KeyIcon from '$lib/components/materialIcons/KeyIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { generateOAuthClientSecret } from '$lib/modules/requests';
  import { formatDuration, writeValueToClipboard } from '$lib/modules/utils';
  import { minuteTimer } from '$lib/stores/timers';

  export let handleClose;
  export let pushNewClientSecret;

  export let clientId;
  let loading = false;
  let clientSecret;
  let clientSecretCopied;
  let copyTimeout;

  let submitting = false;

  async function generateClientSecret() {
    submitting = true;
    try {
      const res = await generateOAuthClientSecret({ id: clientId });
      clientSecret = res.data;
      pushNewClientSecret({ ...clientSecret, value: `${clientSecret.value.substring(0, 5)}${'*'.repeat(6)}` });
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      submitting = false;
    }
  }

  async function copyClientSecretToClipboard() {
    clearTimeout(copyTimeout);
    writeValueToClipboard(clientSecret.value);
    clientSecretCopied = true;
    copyTimeout = setTimeout(() => {
      clientSecretCopied = false;
    }, 3000);
  }
</script>

<FlexContainer column gap="1.5rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin">Generate Client Secret</h3>
    <Button height="auto" on:click={handleClose} blendin rounded>
      <CloseIcon dimension="25px" />
    </Button>
  </FlexContainer>

  {#if clientSecret}
    <FlexContainer column gap="0.5rem">
      <Button on:click={copyClientSecretToClipboard} basic padding="0px 0.5rem" rounded>
        <GridContainer margin="0 0 0 0" padding="0.5rem" justify_items="stretch" template_columns="auto 1fr auto" align_items="center" gap="0.7rem" rounded>
          <KeyIcon dimension="20px" />
          <FlexContainer column align_items="start" nooverflow>
            <h6 class="secret mono no-margin oneline">{clientSecret.value}</h6>
            <span class="xs">Added {formatDuration(clientSecret.created_at - $minuteTimer)}.</span>
          </FlexContainer>
          {#if clientSecretCopied}
            <span class="note">copied</span>
          {:else}
            <CopyIcon dimension="16px" />
          {/if}
        </GridContainer>
      </Button>
      <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">Make sure to copy your client secret now. You won't be able to view it again.</span>
      </GridContainer>
    </FlexContainer>

    <Button on:click={handleClose} width="100%" height="100%" padding="0.5rem 0" basic border rounded disabled={loading}>Close</Button>
  {:else}
    <span class="sm">Client Secrets should only be used by the backend servers of your application and must be securely stored.</span>

    <Button on:click={generateClientSecret} primary rounded disabled={submitting}>
      {#if submitting}
        Generating...
      {:else}
        Generate
      {/if}
    </Button>
  {/if}
</FlexContainer>

<style>
  h6.secret {
    max-width: 100%;
  }
</style>
