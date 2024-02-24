<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Tag from '$lib/components/common/Tag.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { displayError } from '$lib/modules/errors';
  import { deleteOAuthAccount, terminateOAuthAccountSessions } from '$lib/modules/requests';
  import { formatDuration } from '$lib/modules/utils';
  import { showSnackbar } from '$lib/stores/snackbar';
  import { minuteTimer } from '$lib/stores/timers';

  export let handleClose;
  export let account;
  let deleting = false;
  let terminating = false;

  async function terminateActiveSessions() {
    terminating = true;
    try {
      await terminateOAuthAccountSessions({ id: account.id });
      showSnackbar({ text: 'Active sessions terminated.' });
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      terminating = false;
    }
  }

  async function revokeAccess() {
    deleting = true;
    try {
      await deleteOAuthAccount({ id: account.id });
      handleClose(account.id);
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      deleting = false;
    }
  }
</script>

<FlexContainer column gap="1rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin">Account Info</h3>
    <Button height="auto" on:click={handleClose} blendin rounded>
      <CloseIcon dimension="25px" />
    </Button>
  </FlexContainer>

  <FlexContainer column margin="0px" justify_items="center" align_items="stretch" gap="1rem">
    <GridContainer template_columns="50px 1fr" align_items="top" padding="0.5rem" gap="0.7rem" border rounded>
      <FlexContainer height="50px" bgColor="var(--new-layer-color)" width="auto" roundedIcon>
        {#if account.client_icon}
          <img alt="icon" src={`data:image/png;base64,${account.client_icon}`} />
        {:else}
          <Logo dimension="100%" color="linear-gradient(#e66465, #9198e5)" opacity="1" blueprint />
        {/if}
      </FlexContainer>
      <FlexContainer column align_items="start" gap="0.2rem">
        <h5 class="no-margin">{account.client_name}</h5>
        <span class="xs">{new URL(account.client_url).host}</span>
        <div>
          <Tag><span class="xs oneline">Created {formatDuration(account.created_at - $minuteTimer)}</span></Tag>
          <Tag><span class="xs oneline">Last login {formatDuration(account.last_auth - $minuteTimer)}</span></Tag>
        </div>
      </FlexContainer>
    </GridContainer>

    <FlexContainer column align_items="center" bgColor="var(--new-layer-color)" padding="0.5rem" gap="0.5rem" rounded>
      <h6 class="no-margin">Account Data</h6>

      {#if !account?.name && !account?.email}
        <FlexContainer column align_items="center">
          <span class="xs">No data has been shared with <strong>{account.client_name}</strong>.</span>
        </FlexContainer>
      {:else}
        <GridContainer template_columns="auto 1fr" align_items="center" gap="0.5rem">
          <div class="gridline"></div>
          {#if !!account?.name}
            <h6 class="no-margin">Name</h6>
            <span class="xs">{account.name}</span>
          {/if}
          {#if !!account?.email}
            <h6 class="no-margin">Email</h6>
            <span class="xs">{account.email}</span>
          {/if}
        </GridContainer>
      {/if}
    </FlexContainer>
  </FlexContainer>
  <FlexContainer column gap="0.5rem">
    <Button on:click={terminateActiveSessions} basic rounded disabled={terminating || deleting}>
      {#if terminating}
        Terminating active sessions...
      {:else}
        Terminate active sessions
      {/if}
    </Button>
    <Button on:click={revokeAccess} danger rounded disabled={deleting}>
      {#if deleting}
        Revoking Access...
      {:else}
        Revoke Access
      {/if}
    </Button>
  </FlexContainer>
</FlexContainer>
