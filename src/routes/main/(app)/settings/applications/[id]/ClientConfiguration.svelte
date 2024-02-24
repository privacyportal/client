<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import CopyIcon from '$lib/components/materialIcons/CopyIcon.svelte';
  import { ENDPOINT } from '$lib/modules/constants';
  import { displayError } from '$lib/modules/errors';
  import { writeValueToClipboard } from '$lib/modules/utils';
  import { onMount } from 'svelte';

  const OIDC_CONFIG_URL = `${ENDPOINT}/.well-known/openid-configuration`;

  const FIELDS = [
    { title: 'Issuer', key: 'issuer' },
    { title: 'Authorization URI', key: 'authorization_endpoint' },
    { title: 'Token URI', key: 'token_endpoint' },
    { title: 'User Info URI', key: 'userinfo_endpoint' }
  ];

  export let handleClose;
  let loading;
  let config;
  let clipboard = {};
  let clipboardTimeout = {};

  async function copyToClipboard(type, value) {
    clearTimeout(clipboardTimeout?.[type]);
    writeValueToClipboard(value);
    clipboard[type] = true;
    clipboardTimeout[type] = setTimeout(() => {
      clipboard[type] = false;
    }, 3000);
  }

  async function fetchOpenIdConfiguration() {
    loading = true;
    try {
      const res = await fetch(OIDC_CONFIG_URL);
      if (!res.ok) throw new Error('Request Failed. Please try again.');
      config = await res.json();
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await fetchOpenIdConfiguration();
  });
</script>

<FlexContainer column gap="1.5rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin">OpenID Client Configuration</h3>
    <Button height="auto" on:click={handleClose} blendin rounded>
      <CloseIcon dimension="25px" />
    </Button>
  </FlexContainer>

  <FlexContainer column align_items="center" justify_content="stretch" gap="2rem">
    <FlexContainer column bgColor="var(--new-layer-color)" align_items="center" justify_content="stretch" padding="0.5rem" gap="1rem" rounded>
      <h5 class="no-margin">OIDC Automatic Config</h5>
      <FlexContainer column gap="0.5rem">
        <Button on:click={() => copyToClipboard('oidc_auto_config', OIDC_CONFIG_URL)} width="100%" xsmall basic rounded>
          <GridContainer width="100%" align_items="center" justify_items="flex-start" template_columns="1fr auto" padding="0 0.3rem 0 0.5rem" gap="0.3rem">
            <span class="oneline mono">{OIDC_CONFIG_URL}</span>
            {#if clipboard?.oidc_auto_config}
              <span class="note">copied</span>
            {:else}
              <CopyIcon dimension="16px" />
            {/if}
          </GridContainer>
        </Button>
      </FlexContainer>
    </FlexContainer>

    {#if loading}
      <h5>Loading...</h5>
    {:else}
      <FlexContainer column bgColor="var(--new-layer-color)" align_items="center" justify_content="stretch" padding="0.5rem" gap="1rem" rounded>
        <h5 class="no-margin">OIDC Manual Config</h5>
        {#each FIELDS as { title, key }}
          {#if config?.[key]}
            <FlexContainer column gap="0.5rem">
              <h6 class="no-margin">{title}</h6>
              <Button on:click={() => copyToClipboard(key, config[key])} width="100%" xsmall basic rounded>
                <GridContainer width="100%" align_items="center" justify_items="flex-start" template_columns="1fr auto" padding="0 0.3rem 0 0.5rem" gap="0.3rem">
                  <span class="oneline mono">{config[key]}</span>
                  {#if clipboard?.[key]}
                    <span class="note">copied</span>
                  {:else}
                    <CopyIcon dimension="16px" />
                  {/if}
                </GridContainer>
              </Button>
            </FlexContainer>
          {/if}
        {/each}
      </FlexContainer>
    {/if}
  </FlexContainer>
</FlexContainer>
