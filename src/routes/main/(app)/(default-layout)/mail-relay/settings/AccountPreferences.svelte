<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import { displayError } from '$lib/modules/errors';
  import { patchRelayAccountSettings } from '$lib/modules/requests';
  import { relayAccounts as relayAccountsStore } from '$lib/stores/relay';

  export let account;
  $: allowUnsafeReply = (account?.unsafe_reply || 'reject') === 'allow';
  let loading = false;

  async function handleAllowUnsafeRepliesToggle(event) {
    const { newValue: allowUnsafeReply, confirm, cancel } = event.detail;
    try {
      loading = true;
      const unsafe_reply = allowUnsafeReply ? 'allow' : 'reject';
      await patchRelayAccountSettings({ accountId: account.id, data: { unsafe_reply } });
      relayAccountsStore.update((accounts) => accounts.map((acct) => (acct.id === account.id ? { ...acct, unsafe_reply } : acct)));
      confirm();
    } catch (err) {
      /* do nothing */
      console.error(err);
      displayError(err);
      cancel(err);
    } finally {
      loading = false;
    }
  }
</script>

<FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
  <FlexContainer column gap="0.7rem">
    <h3 class="no-margin">Account Preferences</h3>
    <FlexContainer margin="0.5rem 0 0 0" column padding="0.5rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
      <FlexContainer column gap="0.1rem">
        <FlexContainer align_items="center" justify_content="space-between">
          <h6 class="no-margin">Allow Unsafe Replies</h6>
          <Toggle on:beforechange={handleAllowUnsafeRepliesToggle} size="12px" danger disabled={loading} checked={allowUnsafeReply} asyncMode />
        </FlexContainer>
        <span class="xs">Sending new replies to emails you previously sent could leak your personal information. By default, Mail Relay blocks unsafe email replies.</span>
      </FlexContainer>
    </FlexContainer>
  </FlexContainer>
</FlexContainer>
