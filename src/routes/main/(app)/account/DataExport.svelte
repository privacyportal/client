<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import { exportAccountData } from '$lib/modules/requests.js';

  let exporting = false;

  async function handleExportRequested() {
    try {
      exporting = true;
      await exportAccountData();
    } finally {
      exporting = false;
    }
  }
</script>

<FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
  <h4 class="no-margin">Data Export</h4>
  <FlexContainer column gap="0.5rem">
    <span class="sm">Instantly export all your account data.</span>
    <Button on:click={handleExportRequested} disabled={exporting} padding="0.3rem 0.5rem" rounded>Export All Data</Button>
  </FlexContainer>
  <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
    <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
    <span class="note">We only store the data that is strictly required to operate the service.</span>
  </GridContainer>
</FlexContainer>
