<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Tag from '$lib/components/common/Tag.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import CopyIcon from '$lib/components/materialIcons/CopyIcon.svelte';
  import WarningIcon from '$lib/components/materialIcons/WarningIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { verifyOAuthApplicationDomain } from '$lib/modules/requests';
  import { writeValueToClipboard } from '$lib/modules/utils';
  import { showSnackbar } from '$lib/stores/snackbar';

  export let handleClose;
  export let clientId;
  export let domain;

  $: domainChunks = (domain?.value || '').split('/');

  let verifying;

  let clipboard = {};
  let clipboardTimeout = {};

  async function verifyDnsRecord() {
    verifying = true;
    try {
      const { data } = await verifyOAuthApplicationDomain({ id: clientId, domain_id: domain.id });
      domain = { ...domain, ...data };
      if (!domain.verified_at) showSnackbar({ text: 'please retry in a few minutes.' });
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      verifying = false;
    }
  }

  async function copyToClipboard(type, value) {
    clearTimeout(clipboardTimeout?.[type]);
    writeValueToClipboard(value);
    clipboard[type] = true;
    clipboardTimeout[type] = setTimeout(() => {
      clipboard[type] = false;
    }, 3000);
  }
</script>

<FlexContainer column gap="1.5rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin">Domain Verification</h3>
    <Button height="auto" on:click={handleClose} blendin rounded>
      <CloseIcon dimension="25px" />
    </Button>
  </FlexContainer>

  <span class="sm">Set the following TXT record to complete your domain verification.</span>

  <FlexContainer column width="100%" bgColor="var(--new-layer-color)" padding="0.5rem" gap="0.5rem" rounded>
    <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
      <h5 class="no-margin">TXT Record</h5>
      {#if domain.verified_at}
        <Tag margin="0.2rem 0 0 0" backgroundColor="var(--positive-color)" icon>
          <CheckCircleIcon dimension="13px" color="var(--color)" />
          <small>Verified</small>
        </Tag>
      {:else}
        <Tag margin="0.2rem 0 0 0" backgroundColor="var(--warning-color)" icon>
          <WarningIcon dimension="13px" color="var(--color)" />
          <small>Not Verified</small>
        </Tag>
      {/if}
    </FlexContainer>
    <GridContainer width="100%" align_items="center" template_columns="auto 1fr" gap="0.5rem">
      <h6 class="no-margin">Name</h6>
      <Button on:click={() => copyToClipboard('name', '@')} width="100%" xsmall basic rounded>
        <GridContainer width="100%" align_items="center" justify_items="flex-start" template_columns="1fr auto" padding="0 0.3rem 0 0.5rem" gap="0.3rem">
          <span class="oneline mono">{domainChunks.length > 1 ? domainChunks[0] : '@'}<small class="domain">.{domainChunks[domainChunks.length - 1]}</small></span>
          {#if clipboard?.name}
            <span class="note">copied</span>
          {:else}
            <CopyIcon dimension="16px" />
          {/if}
        </GridContainer>
      </Button>
    </GridContainer>

    <GridContainer align_items="center" template_columns="auto 1fr" gap="0.5rem">
      <h6 class="no-margin">Value</h6>
      <Button width="100%" on:click={() => copyToClipboard('value', `privacyportal-verification=${domain.code}`)} xsmall basic rounded>
        <GridContainer align_items="center" justify_items="flex-start" template_columns="1fr auto" padding="0 0.3rem 0 0.5rem" gap="0.3rem">
          <span class="xs oneline mono">privacyportal-verification={domain.code}</span>
          {#if clipboard?.value}
            <span class="note">copied</span>
          {:else}
            <CopyIcon dimension="16px" />
          {/if}
        </GridContainer>
      </Button>
    </GridContainer>
  </FlexContainer>

  {#if domain.verified_at}
    <Button on:click={handleClose} basic rounded>Close</Button>
  {:else}
    <Button on:click={verifyDnsRecord} primary rounded disabled={verifying}>
      {#if verifying}
        verifying...
      {:else}
        Verify Now
      {/if}
    </Button>
  {/if}
</FlexContainer>

<style>
  span > small.domain {
    opacity: 0.5;
  }
</style>
