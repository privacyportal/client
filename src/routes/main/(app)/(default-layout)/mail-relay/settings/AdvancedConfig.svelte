<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import { displayError } from '$lib/modules/errors';
  import { patchRelayAccountSettings } from '$lib/modules/requests';
  import { relayAccounts as relayAccountsStore } from '$lib/stores/relay';

  export let account;
  let loading = false;

  async function handleKillSwitchActivationToggle() {
    loading = true;
    try {
      const strict = !account?.strict;
      await patchRelayAccountSettings({ accountId: account.id, data: { strict } });
      relayAccountsStore.update((accounts) => accounts.map((acct) => (acct.id === account.id ? { ...acct, strict } : acct)));
    } catch (err) {
      /* do nothing */
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
  }
</script>

<FlexContainer margin="0.5rem 0 0 0" column padding="0.5rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
  <FlexContainer align_items="center" justify_content="space-between">
    <h5 class="no-margin">Advanced Config</h5>
  </FlexContainer>
  <div class="gridline" />
  <FlexContainer column>
    <FlexContainer align_items="center" justify_content="space-between">
      <h6 class="no-margin">Kill Switch</h6>
      <Toggle on:click={handleKillSwitchActivationToggle} size="12px" disabled={loading} checked={!!account?.strict} />
    </FlexContainer>
    <span class="xs">When enabled, Mail Relay rejects all inbound mail if no valid encryption profile is found (e.g. at profile expiration).</span>
  </FlexContainer>
</FlexContainer>
