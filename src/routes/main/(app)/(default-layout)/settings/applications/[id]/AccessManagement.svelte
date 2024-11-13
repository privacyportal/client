<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import { displayError } from '$lib/modules/errors';
  import { publishOAuthApplication, unpublishOAuthApplication } from '$lib/modules/requests';

  export let selected;
  export let loading;
  export let clientId;
  export let published_at;
  let accessChanging;

  async function handlePublicAccessToggle() {
    accessChanging = true;
    try {
      if (!published_at) {
        // deactivate
        await publishOAuthApplication({ id: clientId });
        published_at = Date.now();
      } else {
        // activate
        await unpublishOAuthApplication({ id: clientId });
        published_at = undefined;
      }
    } catch (err) {
      /* do nothing */
      console.error(err);
      displayError(err);
    } finally {
      accessChanging = false;
    }
  }
</script>

<FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale onlymobile alwaysDisplay={selected}>
  <FlexContainer align_items="center">
    <h4 class="no-margin oneline">Access Management</h4>
  </FlexContainer>

  <div class="gridline" />
  <FlexContainer column gap="0.15rem">
    <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
      <h5 class="no-margin">Public Access</h5>
      <Toggle on:click={handlePublicAccessToggle} size="13px" checked={!!published_at} disabled={accessChanging || loading} />
    </FlexContainer>
    <span class="xs">When enabled, any Privacy Portal user would be able to sign in to your application. By default, only you have access.</span>
  </FlexContainer>
</FlexContainer>
