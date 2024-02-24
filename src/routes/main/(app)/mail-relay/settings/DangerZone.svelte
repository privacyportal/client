<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import ArrowDropDownIcon from '$lib/components/materialIcons/ArrowDropDownIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { deleteRelayAccount } from '$lib/modules/requests';
  import { showSnackbar } from '$lib/stores/snackbar';

  let loading = false;

  export let handleAccountDeleted;
  export let id;
  export let email;
  let viewExpanded = false;

  function toggleViewExpanded() {
    viewExpanded = !viewExpanded;
  }

  async function handleDeleteApp() {
    if (!confirm(`Are you sure you want to delete the "${email}" account?`)) return;
    loading = true;
    try {
      await deleteRelayAccount({ accountId: id });
      showSnackbar({ text: 'Account successfully deleted.' });
      handleAccountDeleted();
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
  }
</script>

<FlexContainer bgColor="var(--new-layer-color)" padding="1.5rem" rounded mobileScale>
  <FlexContainer column gap="0.7rem">
    <Button on:click={toggleViewExpanded} height="auto" width="100%" blendin nohover rounded>
      <FlexContainer align_items="center" justify_content="space-between">
        <h5 class="no-margin">Danger Zone</h5>
        <ArrowDropDownIcon opened={viewExpanded} dimension="18px" />
      </FlexContainer>
    </Button>

    {#if viewExpanded}
      <Button on:click={handleDeleteApp} margin="0.3rem 0 0 0" disabled={loading} danger rounded><small>Delete Account</small></Button>
      <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">Deleting a Mail Relay account completely removes this personal email address from our servers.</span>
      </GridContainer>
    {/if}
  </FlexContainer>
</FlexContainer>
