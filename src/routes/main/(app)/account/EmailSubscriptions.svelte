<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import { LANDING_CLIENT_URL } from '$lib/modules/constants';
  import { activateEmailSubscription, deactivateEmailSubscription, getEmailSubscriptions } from '$lib/modules/requests';
  import { onMount } from 'svelte';

  let loading = false;
  let emailSubscriptions;

  async function updateEmailSubscriptionToggle(id, newState) {
    try {
      loading = true;
      // toggle state
      newState ? await activateEmailSubscription(id) : await deactivateEmailSubscription(id);
      emailSubscriptions = emailSubscriptions.map((item) => (item.id === id ? { ...item, enabled: newState } : item));
    } finally {
      loading = false;
    }
  }

  async function fetchEmailSubscriptions() {
    try {
      loading = true;
      const { data } = await getEmailSubscriptions();
      emailSubscriptions = data || [];
    } finally {
      loading = false;
    }
  }

  onMount(fetchEmailSubscriptions);
</script>

<FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
  <h4 class="no-margin">Email Subscriptions</h4>
  <span class="sm">Subscribe to our emails to get latest development on Privacy Portal products. You can also visit our <a href={LANDING_CLIENT_URL + '/blog'}>blog</a>.</span>
  <div class="gridline" />

  {#if emailSubscriptions}
    <FlexContainer column gap="0.5rem">
      {#each emailSubscriptions as { id, name, rate, description, enabled }}
        <FlexContainer column>
          <FlexContainer align_items="center" justify_content="space-between">
            <h6 class="no-margin">{name} <small>({rate})</small></h6>
            <Toggle on:click={() => updateEmailSubscriptionToggle(id, !enabled)} size="12px" disabled={loading} checked={enabled} />
          </FlexContainer>
          <span class="xs">{description}</span>
        </FlexContainer>
      {/each}
    </FlexContainer>
  {:else}
    <p>Loading...</p>
  {/if}
</FlexContainer>
