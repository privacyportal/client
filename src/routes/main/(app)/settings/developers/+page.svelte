<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import { isEnhancedProtection } from '$lib/stores/account';
  import { applications as applicationsStore } from '$lib/stores/applications';
  import ApplicationList from './ApplicationList.svelte';
  import NewApplication from './NewApplication.svelte';

  let newApplicationModalOpened = false;

  async function openNewApplicationModal() {
    newApplicationModalOpened = true;
  }
</script>

<Modal bind:open={newApplicationModalOpened} header minWidth="300px" maxWidth="500px">
  <NewApplication handleClose={() => (newApplicationModalOpened = false)} />
</Modal>

<FlexContainer column padding="1rem" align_items="flex-start" justify_content="flex-start" gap="1rem">
  <h1 class="no-margin">Developer Settings</h1>
  <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <h4 class="no-margin">OAuth Applications</h4>
    <span class="sm">Easily register your applications for "Sign in with Privacy Portal".</span>

    {#if $isEnhancedProtection}
      <ApplicationList {openNewApplicationModal} />
    {/if}
    {#if $applicationsStore?.length === 0}
      <Button on:click={openNewApplicationModal} disabled={!$isEnhancedProtection} primary rounded><small>New Application</small></Button>
    {/if}
  </FlexContainer>
</FlexContainer>
