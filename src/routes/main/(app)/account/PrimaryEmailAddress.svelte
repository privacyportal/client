<script>
  import Button from '$lib/components/common/Button.svelte';
  import Select from '$lib/components/common/Select.svelte';
  import { displayError } from '$lib/modules/errors';
  import { changePrimaryEmail, getRelayAccounts } from '$lib/modules/requests';
  import { onMount } from 'svelte';

  let loading;
  let saving;
  let emailAddresses = [];
  let selectedAddressId;
  $: emailAddressesSelectOptions = emailAddresses.map((addr) => ({ text: addr.email, value: addr.id }));
  $: primaryEmailAddressId = emailAddresses.find((add) => add.default === true)?.id;

  function unsetField(obj, fieldName) {
    delete obj[fieldName];
    return obj;
  }

  async function handlePrimaryEmailChanged(accountId) {
    saving = true;
    try {
      await changePrimaryEmail({ id: accountId });
      emailAddresses = emailAddresses.map((addr) => (addr.id === accountId ? { ...addr, default: true } : unsetField(addr, 'default')));
      selectedAddressId = emailAddresses.find((add) => add.default === true)?.id;
    } catch (err) {
      displayError(err);
    } finally {
      saving = false;
    }
  }

  async function fetchEmailAddresses() {
    loading = true;
    try {
      const res = await getRelayAccounts();
      emailAddresses = res.data.filter((addr) => !!addr.verified_at);
      selectedAddressId = emailAddresses.find((addr) => addr.default === true)?.id;
    } catch (err) {
      displayError(err);
    } finally {
      loading = false;
    }
  }

  onMount(fetchEmailAddresses);
</script>

<h4 class="no-margin">Primary Email Address</h4>
{#if !loading && emailAddresses.length > 1}
  <Select bind:value={selectedAddressId} options={emailAddressesSelectOptions} disabled={saving} />
  {#if selectedAddressId !== primaryEmailAddressId}
    <Button on:click={() => handlePrimaryEmailChanged(selectedAddressId)} disabled={saving} padding="0.3rem 0.5rem" primary rounded>Save</Button>
  {/if}
{:else}
  <span>{emailAddresses?.[0]?.email || 'Loading...'}</span>
{/if}
