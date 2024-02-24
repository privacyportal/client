<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import { displayError } from '$lib/modules/errors';
  import { createRelayAccount } from '$lib/modules/requests';
  import { relayAccounts as relayAccountsStore } from '$lib/stores/relay';

  export let handleClose;
  let loading;
  let email;

  async function handleSubmit() {
    loading = true;
    try {
      const res = await createRelayAccount({ email });
      relayAccountsStore.update((accounts) => [...accounts, res.data]);
      handleClose();
    } catch (err) {
      displayError(err);
    } finally {
      loading = false;
    }
  }
</script>

<FlexContainer column gap="0.5rem">
  <FlexContainer gap="0.5rem" align_items="center">
    <h4 class="no-margin">New Account</h4>
  </FlexContainer>

  <Form on:submit={handleSubmit}>
    <FlexContainer column gap="0.25rem">
      <Input type="email" name="email" placeholder="Email" bind:value={email} disabled={loading} />
      <Button type="submit" padding="0 0.5rem" disabled={loading} primary="true" rounded>Add Account</Button>
    </FlexContainer>
  </Form>
</FlexContainer>
