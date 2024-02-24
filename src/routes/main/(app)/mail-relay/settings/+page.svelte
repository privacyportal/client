<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Tag from '$lib/components/common/Tag.svelte';
  import ArrowDropDownIcon from '$lib/components/materialIcons/ArrowDropDownIcon.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import LockIcon from '$lib/components/materialIcons/LockIcon.svelte';
  import NoEncryptionIcon from '$lib/components/materialIcons/NoEncryptionIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { createRelayAccount, getProfiles, getRelayAccounts, resendRelayAccountVerificationCode, verifyRelayAccount } from '$lib/modules/requests';
  import { gotoPage } from '$lib/modules/routingUtils';
  import { isEnhancedProtection } from '$lib/stores/account';
  import { defaultProfile, profiles as profilesStore } from '$lib/stores/profiles';
  import { relayAccounts as relayAccountsStore } from '$lib/stores/relay';
  import { showSnackbar } from '$lib/stores/snackbar';
  import { onDestroy, onMount } from 'svelte';
  import AdvancedConfig from './AdvancedConfig.svelte';
  import DangerZone from './DangerZone.svelte';
  import NewAccount from './NewAccount.svelte';
  import NewPgp from './NewPGP.svelte';
  import NewSmime from './NewSMIME.svelte';
  import ProfileList from './ProfileList.svelte';
  import SmimeExport from './SmimeExport.svelte';

  let exportModalOpened;
  let newProfileModalOpened;
  let showPGP = true;
  let newAccountModalOpened;
  let loading = false;
  let fetchingAccountProfiles;
  let relayAccounts = [];
  let selectedAccountId;
  let accountsModalOpened;
  let addAccountEmail;
  let verificationCode;
  let resendingCode;
  let submittingCode;

  $: selectedAccount = relayAccounts.find((acct) => acct.id === selectedAccountId);

  function openNewProfileModal() {
    if (!newProfileModalOpened) {
      newProfileModalOpened = true;
    }
  }

  function toggleShowPgpOrSmime() {
    showPGP = !showPGP;
  }

  async function handleVerificationSubmitted(selectedAccountId) {
    submittingCode = true;
    try {
      await verifyRelayAccount({ accountId: selectedAccountId, code: verificationCode });
      relayAccountsStore.update((accounts) => accounts.map((acct) => (acct.id === selectedAccountId ? { ...acct, verified_at: Date.now() } : acct)));
      await handleAccountSelected(selectedAccountId, { skipFetch: true });
    } catch (err) {
      displayError(err);
    } finally {
      submittingCode = false;
    }
  }

  async function handleResendCode() {
    resendingCode = true;
    try {
      await resendRelayAccountVerificationCode({ accountId: selectedAccountId });
      showSnackbar({ text: 'code successfully resent.' });
    } catch (err) {
      displayError(err);
    } finally {
      resendingCode = false;
    }
  }

  async function handleAddAccount() {
    loading = true;
    try {
      const res = await createRelayAccount({ email: addAccountEmail });
      relayAccountsStore.update((accounts) => [...accounts, res.data]);
      await handleAccountSelected(res.data.id);
      addAccountEmail = undefined;
    } catch (err) {
      displayError(err);
    } finally {
      loading = false;
    }
  }

  async function handleAccountSelected(accountId, opts) {
    selectedAccountId = accountId;
    accountsModalOpened = false;
    if (!opts?.skipFetch) await fetchAccountProfiles();
  }

  async function fetchAccountProfiles() {
    console.log('fetchAccountProfiles');
    fetchingAccountProfiles = true;
    try {
      const res = await getProfiles({ accountId: selectedAccountId });
      console.log(res.data);
      profilesStore.set(res.data);
    } catch (err) {
      displayError(err);
    } finally {
      fetchingAccountProfiles = false;
    }
  }

  const unsubscribeRelayAccounts = relayAccountsStore.subscribe(async (value) => {
    relayAccounts = value;
    if (!selectedAccountId || !relayAccounts.some((acct) => acct.id === selectedAccountId)) {
      selectedAccountId = relayAccounts[0]?.id;
      if (selectedAccountId) {
        await fetchAccountProfiles();
      }
    }
    console.log('relayAccounts updated', relayAccounts);
  });

  async function fetchRelayAccounts() {
    loading = true;
    try {
      const res = await getRelayAccounts();
      console.log(res.data);
      relayAccountsStore.set(res.data);
    } catch (err) {
      displayError(err);
    } finally {
      loading = false;
    }
  }

  onMount(fetchRelayAccounts);
  onDestroy(() => {
    console.log('ON_DESTROY');
    selectedAccountId = undefined;
    unsubscribeRelayAccounts();
  });
</script>

<Modal bind:open={exportModalOpened} maxWidth="500px">
  <SmimeExport />
</Modal>

<Modal bind:open={newProfileModalOpened} header maxWidth="500px">
  <FlexContainer height="100%" column gap="1rem">
    <FlexContainer justify_content="center" zeroFlexShrink>
      <GridContainer width="100%" template_columns="50% 50%" bgColor="var(--border-color)" border rounded gap="1px" padding="0px">
        <Button on:click={toggleShowPgpOrSmime} width="100%" padding="0.15rem 0.3rem" height="18px" selected={showPGP} strongSelect disabled={showPGP}><small>PGP</small></Button>
        <Button on:click={toggleShowPgpOrSmime} width="100%" padding="0.15rem 0.3rem" height="18px" selected={!showPGP} strongSelect disabled={!showPGP}><small>S/MIME</small></Button>
      </GridContainer>
    </FlexContainer>
    {#if showPGP}
      <NewPgp accountId={selectedAccountId} handleClose={() => (newProfileModalOpened = false)} />
    {:else}
      <NewSmime account={selectedAccount} handleClose={() => (newProfileModalOpened = false)} />
    {/if}
  </FlexContainer>
</Modal>

<Modal bind:open={newAccountModalOpened} header minWidth="300px" maxWidth="500px">
  <NewAccount handleClose={() => (newAccountModalOpened = false)} />
</Modal>

<Modal bind:open={accountsModalOpened} header minWidth="300px" maxWidth="500px">
  <FlexContainer column gap="1rem">
    <FlexContainer align_items="center" justify_content="space-between">
      <h3 class="no-margin">Select Account</h3>
      <Button
        height="auto"
        on:click={() => {
          accountsModalOpened = false;
        }}
        blendin
        rounded
      >
        <CloseIcon dimension="25px" />
      </Button>
    </FlexContainer>
    <GridContainer align_items="center" template_columns="1fr" bgColor="var(--new-layer-color)" rounded border>
      {#each relayAccounts as account, index}
        <Button on:click={() => handleAccountSelected(account.id)} width="100%" padding="0.3rem 0.5rem">
          <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
            <span class="sm">{account.email}</span>
            {#if !account.verified_at}
              <Tag><span class="xs">Unverified</span></Tag>
            {/if}
          </FlexContainer>
        </Button>
        {#if index < relayAccounts.length - 1}
          <div class="gridline" />
        {/if}
      {/each}
    </GridContainer>

    {#if $isEnhancedProtection}
      <Form on:submit={handleAddAccount}>
        <GridContainer align_items="center" template_columns="1fr auto" mobile_template_columns="minmax(50%, 1fr) auto" gap="0.5rem">
          <Input type="email" name="email" placeholder="Email" bind:value={addAccountEmail} disabled={loading} />
          <Button type="submit" padding="0 0.5rem" disabled={loading} primary="true" rounded><small>Add Account</small></Button>
        </GridContainer>
      </Form>
    {/if}
  </FlexContainer>
</Modal>

<FlexContainer column padding="1rem" align_items="flex-start" justify_content="flex-start" gap="1rem">
  <h1 class="no-margin">Relay Settings</h1>

  {#if !selectedAccountId || !selectedAccount?.id}
    <h5 class="no-margin">Loading...</h5>
  {:else}
    {#if $isEnhancedProtection || relayAccounts.length > 1}
      <Button width="100%" on:click={() => (accountsModalOpened = true)} padding="0 0 0 0.5rem" rounded border>
        <GridContainer align_items="center" template_columns="1fr 20px" gap="0.5rem" padding="0 0 0 0.3rem">
          <span>{selectedAccount.email}</span>
          <ArrowDropDownIcon dimension="20px" />
        </GridContainer>
      </Button>
    {:else}
      <FlexContainer height="35px" align_items="center" justify_content="center" textCentered rounded border>
        <span class="unselectable">{selectedAccount.email}</span>
      </FlexContainer>
    {/if}

    {#if selectedAccount.verified_at}
      <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
        <FlexContainer column gap="0.7rem">
          <h3 class="no-margin">Email Encryption</h3>
          <p class="no-margin"><small>Enable encryption between <strong>Mail Relay</strong> and your <strong>email client(s)</strong> with encryption profiles.</small></p>
          {#if fetchingAccountProfiles}
            <h5 class="no-margin">Loading...</h5>
          {:else}
            <GridContainer align_items="center" template_columns="minmax(1.5rem, 10rem) auto" padding="0.5rem" gap="0.5rem" bgColor="var(--new-layer-color)" rounded border>
              <h6 class="no-margin">Inbound Mail Encryption</h6>
              <GridContainer align_items="center" template_columns="min-content auto" gap="0.3rem">
                {#if $isEnhancedProtection && $defaultProfile?.enabled}
                  <LockIcon dimension="14px" color="var(--positive-color)" />
                  <span><small>Encrypted with {$defaultProfile?.type === 'pgp' ? 'PGP' : 'S/MIME'}</small></span>
                {:else}
                  <NoEncryptionIcon dimension="14px" color={selectedAccount?.strict ? 'var(--danger-color)' : 'var(--warning-color)'} />
                  <span><small>Not Encrypted{selectedAccount?.strict ? ' (Mail Rejected)' : ''}</small></span>
                {/if}
              </GridContainer>
              <div class="gridline" />
              <h6 class="no-margin">Outbound Mail Encryption</h6>
              <GridContainer align_items="center" template_columns="min-content auto" gap="0.3rem">
                {#if $isEnhancedProtection && $profilesStore?.length > 0}
                  <LockIcon dimension="14px" color="var(--positive-color)" />
                  <span><small>Decrypted with corresponding profile</small></span>
                {:else}
                  <NoEncryptionIcon dimension="14px" color="var(--warning-color)" />
                  <span><small>Not Encrypted</small></span>
                {/if}
              </GridContainer>
            </GridContainer>
            {#if $isEnhancedProtection}
              <ProfileList {openNewProfileModal} />
              {#if $profilesStore?.length === 0}
                <Button on:click={openNewProfileModal} disabled={!$isEnhancedProtection} primary rounded><small>New Encryption Profile</small></Button>
              {/if}
              <AdvancedConfig account={selectedAccount} />
            {/if}
          {/if}
        </FlexContainer>
      </FlexContainer>
    {:else}
      <FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
        <FlexContainer column gap="0.7rem">
          <h3 class="no-margin">Account Verification</h3>
          <span class="no-margin sm">A verification code has been sent to your email.</span>
          <Form on:submit={() => handleVerificationSubmitted(selectedAccountId)}>
            <FlexContainer column align_items="center" gap="0.5rem">
              <GridContainer align_items="center" template_columns="1fr auto" mobile_template_columns="1fr" gap="0.5rem 0.25rem">
                <Input width="100%" type="text" name="code" placeholder="Verification Code" autocomplete="off" bind:value={verificationCode} disabled={resendingCode || submittingCode} />
                <Button width="100%" type="submit" padding="0 1rem" disabled={resendingCode || submittingCode} primary="true" rounded>Verify Account</Button>
              </GridContainer>
              <span class="xs"><a on:click={handleResendCode} href class="text-color">resend code</a></span>
            </FlexContainer>
          </Form>
        </FlexContainer>
      </FlexContainer>
    {/if}

    {#if !selectedAccount?.default}
      <DangerZone handleAccountDeleted={fetchRelayAccounts} id={selectedAccount?.id} email={selectedAccount?.email} />
    {/if}
  {/if}

  {#if !$isEnhancedProtection}
    <FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale>
      <h4 class="no-margin">Get Enhanced Protection</h4>
      <GridContainer gap="0.25rem" align_items="center" template_columns="20px auto">
        <CheckCircleIcon dimension="18px" /><span><small>Get Unlimited Privacy Addresses</small></span>
        <CheckCircleIcon dimension="18px" /><span><small>Add up to 5 personal emails</small></span>
        <CheckCircleIcon dimension="18px" /><span><small>Encrypt emails with PGP or S/MIME</small></span>
        <CheckCircleIcon dimension="18px" /><span><small>Encrypted Outbound Mail</small></span>
        <CheckCircleIcon dimension="18px" /><span><small>Stop metadata leaks</small></span>
        <CheckCircleIcon dimension="18px" /><span><small>And much more...</small></span>
      </GridContainer>
      <Button on:click={gotoPage('/account')} padding="0.3rem 0.4rem" primary rounded><small>Go to Account</small></Button>
    </FlexContainer>
  {/if}
</FlexContainer>
