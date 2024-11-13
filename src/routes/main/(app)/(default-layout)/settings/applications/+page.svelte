<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import EditIcon from '$lib/components/materialIcons/EditIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { displayError } from '$lib/modules/errors';
  import { getOAuthAccounts } from '$lib/modules/requests';
  import { formatDuration } from '$lib/modules/utils';
  import { authorizedApps as authorizedAppsStore } from '$lib/stores/applications';
  import { minuteTimer } from '$lib/stores/timers';
  import { onDestroy, onMount } from 'svelte';
  import AccountInfo from './AccountInfo.svelte';

  let loading = false;
  let accountInfoModalOpened = false;
  let authorizedApps;
  let selectedAccount;

  function handleClose(revokedAccId) {
    if (revokedAccId) {
      authorizedAppsStore.update((apps) => apps.filter((app) => app.id !== revokedAccId));
    }
    accountInfoModalOpened = false;
  }

  const unsubscribeAuthorizedApps = authorizedAppsStore.subscribe((value) => {
    authorizedApps = value;
  });

  function openAccountInfoModal(app) {
    selectedAccount = app;
    accountInfoModalOpened = true;
  }

  async function fetchAuthorizedApps(page) {
    loading = true;
    try {
      const res = await getOAuthAccounts(page);
      console.log(res.data);
      authorizedAppsStore.set(res.data);
    } catch (err) {
      displayError(err);
    } finally {
      loading = false;
    }
  }

  onMount(fetchAuthorizedApps);
  onDestroy(unsubscribeAuthorizedApps);
</script>

<Modal bind:open={accountInfoModalOpened} header minWidth="300px" maxWidth="500px">
  <AccountInfo account={selectedAccount} {handleClose} />
</Modal>

<FlexContainer column padding="1rem" align_items="flex-start" justify_content="flex-start" gap="1rem">
  <h1 class="no-margin">Authorized Apps</h1>
  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <h4 class="no-margin">Private Accounts</h4>
    <span class="xs">Applications using "Sign in with Privacy Portal".</span>

    {#if authorizedApps?.length > 0}
      <GridContainer margin="0 0 0 0" justify_items="stretch" template_columns="35px 1fr auto" align_items="center" gap="0.7rem">
        <div class="gridline"></div>
        {#each authorizedApps as account}
          <FlexContainer height="35px" bgColor="var(--new-layer-color)" width="auto" roundedIcon>
            {#if account.client_icon}
              <img alt="icon" src={`data:image/png;base64,${account.client_icon}`} />
            {:else}
              <Logo dimension="100%" color="linear-gradient(#e66465, #9198e5)" opacity="1" blueprint />
            {/if}
          </FlexContainer>
          <FlexContainer column gap="0.3rem">
            <h6 class="no-margin">{account.client_name}</h6>
            <span class="xs">Created {formatDuration(account.created_at - $minuteTimer)}.</span>
          </FlexContainer>
          <Button on:click={openAccountInfoModal(account)} padding="2px 7px" blendin rounded>
            <EditIcon dimension="20px" />
          </Button>
          <div class="gridline"></div>
        {/each}
      </GridContainer>
    {:else if authorizedApps}
      <div class="gridline"></div>
      <GridContainer template_columns="18px auto" align_items="center" margin="0" padding="0.5rem 0px" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">You don't have any apps using "Sign in with Privacy Portal"</span>
      </GridContainer>
    {:else}
      <div class="gridline"></div>
      <span class="xs">Loading...</span>
    {/if}
  </FlexContainer>
</FlexContainer>
