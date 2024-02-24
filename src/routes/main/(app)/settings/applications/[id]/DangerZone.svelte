<script>
  import { goto } from '$app/navigation';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import ArrowDropDownIcon from '$lib/components/materialIcons/ArrowDropDownIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { deleteOAuthApplication } from '$lib/modules/requests';

  let loading = false;

  export let selected;
  export let id;
  export let name;
  let viewExpanded = false;

  function toggleViewExpanded() {
    viewExpanded = !viewExpanded;
  }

  async function handleDeleteApp() {
    if (!confirm(`Are you sure you want to delete the "${name}" application?`)) return;
    loading = true;
    try {
      await deleteOAuthApplication({ id });
      goto(`/settings/developers`);
    } catch (err) {
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
  }
</script>

<FlexContainer bgColor="var(--new-layer-color)" padding="1.5rem" rounded mobileScale onlymobile alwaysDisplay={selected}>
  <FlexContainer column gap="0.7rem" onlymobile>
    <Button on:click={toggleViewExpanded} height="auto" width="100%" blendin nohover rounded>
      <FlexContainer align_items="center" justify_content="space-between">
        <h5 class="no-margin">Danger Zone</h5>
        <ArrowDropDownIcon opened={viewExpanded} dimension="18px" />
      </FlexContainer>
    </Button>

    {#if viewExpanded}
      <Button on:click={handleDeleteApp} margin="0.3rem 0 0 0" disabled={loading} danger rounded><small>Delete Application</small></Button>
      <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">Deleted applications cannot be recovered.</span>
      </GridContainer>
    {/if}
  </FlexContainer>

  <FlexContainer column gap="0.7rem" nomobile>
    <h5 class="no-margin">Danger Zone</h5>
    <Button on:click={handleDeleteApp} margin="0.3rem 0 0 0" disabled={loading} danger rounded><small>Delete Application</small></Button>
    <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
      <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
      <span class="note">Deleted applications cannot be recovered.</span>
    </GridContainer>
  </FlexContainer>
</FlexContainer>
