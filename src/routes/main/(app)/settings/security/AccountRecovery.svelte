<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import WarningIcon from '$lib/components/materialIcons/WarningIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { activateEmailRecovery, deactivateEmailRecovery, deleteEmailRecoveryTotp, getEmailRecovery } from '$lib/modules/requests';
  import { onMount } from 'svelte';
  import RegisterTotp from './RegisterTOTP.svelte';

  export let loadingAuthenticators;
  export let authenticators;

  let loading = true;
  let updating;
  let emailRecovery;
  let totpModalOpened = false;

  async function fetchEmailRecovery() {
    loading = true;
    try {
      const res = await getEmailRecovery();

      console.log(res.data);
      emailRecovery = res.data;
    } catch (err) {
      displayError(err);
    } finally {
      loading = false;
    }
  }

  async function updateEmailRecoveryToggle(newState) {
    try {
      updating = true;
      // toggle state
      newState ? await activateEmailRecovery() : await deactivateEmailRecovery();
      emailRecovery.enabled = newState;
    } finally {
      updating = false;
    }
  }

  async function disable2FA() {
    try {
      updating = true;
      await deleteEmailRecoveryTotp();
      emailRecovery.totp = undefined;
    } finally {
      updating = false;
    }
  }

  async function handleTotpRegistration() {
    totpModalOpened = false;
    emailRecovery.totp = { updated_at: Date.now() };
  }

  onMount(async () => {
    await fetchEmailRecovery();
  });
</script>

<Modal bind:open={totpModalOpened} header maxWidth="400px" padding="0px">
  <RegisterTotp done={handleTotpRegistration} cancel={() => (totpModalOpened = false)} />
</Modal>

<FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
  <h4 class="no-margin">Account Recovery</h4>
  <span class="sm">Make sure you can recover your account in case of device loss.</span>

  {#if loading}
    <p>loading...</p>
  {:else}
    <GridContainer align_items="stretch" template_columns="1fr 1fr" mobile_template_columns="1fr" gap="0.5rem 1rem" margin="0.5rem 0 0 0">
      <FlexContainer column padding="0.7rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
        <FlexContainer align_items="center" justify_content="space-between">
          <h5 class="no-margin">Enable Email Recovery</h5>
          <Toggle on:click={() => updateEmailRecoveryToggle(!emailRecovery?.enabled)} size="12px" warning={!emailRecovery?.totp} disabled={updating} checked={emailRecovery?.enabled} />
        </FlexContainer>
        <span class="xs"
          >Use your primary email to regain access to your Privacy Portal account.{#if !emailRecovery?.totp}
            For better security, please enable Two Factor Authentication.{/if}</span
        >
        {#if emailRecovery?.enabled}
          {#if !emailRecovery?.totp}
            <Button
              on:click={() => {
                totpModalOpened = true;
              }}
              width="100%"
              height="auto"
              padding="0.2rem 0"
              xsmall
              basic
              border
              rounded
              disabled={updating || totpModalOpened}>Setup 2FA</Button
            >
          {:else}
            <Button on:click={disable2FA} width="100%" height="auto" padding="0.2rem 0" xsmall danger light rounded disabled={updating || totpModalOpened}>Disable 2FA</Button>
          {/if}
        {/if}
      </FlexContainer>
      <FlexContainer column padding="0.7rem" bgColor="var(--new-layer-color)" align_items="center" gap="0.5rem" rounded>
        <FlexContainer align_items="center" justify_content="center">
          <h5 class="no-margin">Account Recovery Status</h5>
        </FlexContainer>
        <GridContainer align_items="center" justify_content="center" template_columns="18px 1fr" gap="1rem 0.3rem">
          {#if loadingAuthenticators}
            <div />
            <span class="xs">loading...</span>
          {:else if authenticators.filter((authenticator) => !!authenticator.enabled).length > 1}
            <CheckCircleIcon dimension="18px" />
            <span class="sm">Your account can be accessed using multiple authenticators.</span>

            {#if emailRecovery?.enabled}
              <CheckCircleIcon color={emailRecovery?.totp ? 'var(--positive-color)' : 'var(--warning-color)'} dimension="18px" />
              <span class="sm">Your account can be recovered using the primary email account.</span>
            {/if}
          {:else if emailRecovery?.enabled}
            <CheckCircleIcon color={emailRecovery?.totp ? 'var(--positive-color)' : 'var(--warning-color)'} dimension="18px" />
            <span class="sm">Your account can be recovered using the primary email account.{!emailRecovery?.totp ? ' But Two Factor Authentication is not configured.' : ''}</span>

            <WarningIcon color="var(--warning-color)" dimension="18px" />
            <span class="sm">You have not configured any additional authenticators for emergency access.</span>
          {:else}
            <WarningIcon color="var(--warning-color)" dimension="18px" />
            <span class="sm">Your account cannot be recovered in case of device loss. Configure an additional authenticator for emergency access.</span>
          {/if}
        </GridContainer>
      </FlexContainer>
    </GridContainer>
  {/if}

  <GridContainer template_columns="18px auto" align_items="center" margin="1.2rem 0 0.5rem 0" gap="0.5rem">
    <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
    <span class="note">For security reasons our support does not handle account recovery tickets.</span>
  </GridContainer>
</FlexContainer>
