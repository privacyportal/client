<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import ArrowDropDownIcon from '$lib/components/materialIcons/ArrowDropDownIcon.svelte';
  import { createRecipient } from '$lib/modules/requests';
  import { isBetaEnhancedProtection } from '$lib/stores/account';
  import { activeAccountsById } from '$lib/stores/relay';
  import { showSnackbar } from '$lib/stores/snackbar';

  export let id;
  export let acct_id;
  export let privacyAddress;
  let recipient;
  let recipientRelayAddress;
  let loading = false;
  let viewExpanded = false;

  $: activeProfile = $activeAccountsById?.[acct_id]?.profile;

  async function handleSubmit() {
    loading = true;
    try {
      if ($isBetaEnhancedProtection) {
        showSnackbar({ text: 'Outbound mail not allowed during beta.' });
      } else {
        const createRecipientResult = await createRecipient({ addressId: id, recipient });
        console.log(createRecipientResult);
        recipientRelayAddress = createRecipientResult.data.recipient_addr;
      }
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function handleModifyRecipient() {
    recipient = undefined;
    recipientRelayAddress = undefined;
  }

  function handleComposeEmail() {
    window.open(`mailto:${recipientRelayAddress}`, '_blank');
  }

  function toggleViewExpanded() {
    viewExpanded = !viewExpanded;
  }
</script>

<Form on:submit={handleSubmit}>
  <FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale>
    <Button on:click={toggleViewExpanded} height="auto" width="100%" blendin nohover rounded>
      <FlexContainer align_items="center" justify_content="space-between">
        <h5 class="no-margin">Send Outbound Mail</h5>
        <ArrowDropDownIcon opened={viewExpanded} dimension="18px" />
      </FlexContainer>
    </Button>

    {#if viewExpanded}
      <GridContainer align_items="center" template_columns="auto 1fr" padding="0.5rem" gap="0.5rem 0.7rem" bgColor="var(--new-layer-color)" rounded border>
        <h6 class="no-margin">From</h6>
        <span class="sm">{privacyAddress}</span>
        <div class="gridline" />
        {#if recipientRelayAddress}
          <h6 class="no-margin">To</h6>
          <span class="sm">{recipient}</span>
        {:else}
          <h5 class="no-margin">To</h5>
          <Input wide type="email" name="email" placeholder="Recipient Address" autocomplete="off" bind:value={recipient} disabled={loading || recipientRelayAddress} />
        {/if}
      </GridContainer>

      {#if recipientRelayAddress}
        <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
          <AnnouncementIcon color="var(--info-color)" dimension="18px" />
          <span class="note">An {activeProfile ? 'encrypted ' : ''}mail has been sent to your personal email address on behalf of "{recipient}".</span>
        </GridContainer>
        <GridContainer width="100%" align_items="center" justify_items="stretch" template_columns={'1fr 1fr'} gap="0.5rem">
          <Button on:click={handleModifyRecipient} width="100%" blendin rounded border>Reset</Button>
          <Button on:click={handleComposeEmail} width="100%" disabled={loading} primary="true" rounded>Compose</Button>
        </GridContainer>
      {:else if recipient}
        <Button type="submit" padding="0 0.5rem" disabled={loading} primary="true" rounded>Start Email Thread</Button>
        <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
          <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
          <span class="note"
            >Mail Relay starts the thread by sending you an {activeProfile ? 'encrypted ' : ''}email on behalf of your recipient. Simply reply to that email to contact your recipient.</span
          >
        </GridContainer>
      {/if}
    {/if}
  </FlexContainer>
</Form>
