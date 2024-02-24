<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import { displayError } from '$lib/modules/errors';
  import { getOAuthApplications } from '$lib/modules/requests';
  import { applications as applicationsStore } from '$lib/stores/applications';
  import { onDestroy, onMount } from 'svelte';
  import Application from './Application.svelte';

  const MAX_PROFILES = 5;

  export let openNewApplicationModal;

  let loading = false;
  let applications;

  const unsubscribeApplications = applicationsStore.subscribe((value) => {
    applications = value;
  });

  async function fetchApplications(page) {
    loading = true;
    try {
      const res = await getOAuthApplications(page);
      console.log(res.data);
      applicationsStore.set(res.data);
    } catch (err) {
      displayError(err);
    } finally {
      loading = false;
    }
  }

  onMount(fetchApplications);
  onDestroy(unsubscribeApplications);
</script>

{#if loading}
  <h5 class="sm-v-margin"><small>Loading...</small></h5>
{:else if applications?.length}
  <FlexContainer margin="0.5rem 0 0 0" column padding="0.5rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <FlexContainer align_items="center" justify_content="space-between">
      <h5 class="no-margin">Applications</h5>
      <Button on:click={openNewApplicationModal} height="auto" padding="0.3rem 0.5rem" primary rounded disabled={applications.length >= MAX_PROFILES}><small>New Application</small></Button>
    </FlexContainer>
    <GridContainer margin="0 0 0 0" justify_items="stretch" template_columns="35px 1fr auto" align_items="center" gap="0.7rem">
      <div class="gridline"></div>
      {#each applications as application}
        <Application {application} />
        <div class="gridline"></div>
      {/each}
    </GridContainer>
  </FlexContainer>
{/if}
