<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import InputLabel from '$lib/components/common/InputLabel.svelte';
  import Select from '$lib/components/common/Select.svelte';
  import Tag from '$lib/components/common/Tag.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import CopyIcon from '$lib/components/materialIcons/CopyIcon.svelte';
  import DescriptionIcon from '$lib/components/materialIcons/DescriptionIcon.svelte';
  import EditIcon from '$lib/components/materialIcons/EditIcon.svelte';
  import LabelIcon from '$lib/components/materialIcons/LabelIcon.svelte';
  import LockIcon from '$lib/components/materialIcons/LockIcon.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import NoEncryptionIcon from '$lib/components/materialIcons/NoEncryptionIcon.svelte';
  import OfflineBoltIcon from '$lib/components/materialIcons/OfflineBoltIcon.svelte';
  import ShareIcon from '$lib/components/materialIcons/ShareIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { activateAddress, createAddress, deactivateAddress, deleteAddress, editAddress, newAddress } from '$lib/modules/requests';
  import { gotoPage } from '$lib/modules/routingUtils';
  import { convertToHostname, writeValueToClipboard } from '$lib/modules/utils';
  import { isEnhancedProtection } from '$lib/stores/account';
  import { MAX_LABEL_LENGTH, MAX_NOTE_LENGTH, newAddressSuggestion } from '$lib/stores/mail';
  import { activeAccountsById } from '$lib/stores/relay';
  import { onMount } from 'svelte';
  import NewRecipient from './NewRecipient.svelte';

  export let editMode = false;
  export let id = undefined;
  export let label = undefined;
  export let note = undefined;
  export let value = undefined;
  export let fwd_to = undefined;
  export let oauth_app_id = undefined;
  export let deactivated_at = undefined;
  export let created_at = undefined;
  export let bounce = undefined;
  export let handleNewAddressCreated = undefined;
  export let handleAddressPatched = undefined;
  export let handleAddressDeleted = undefined;
  export let handleClose = undefined;

  let showEditForm = false;

  let generatingAddress = false;
  let activationChanging = false;
  let silentModeChanging = false;

  $: _label = label;
  $: _note = note;
  $: _fwd_to = fwd_to;
  $: logoHostname = convertToHostname(label);

  $: dirty = _label !== label || _note !== note;

  let loading = false;

  let copyTimeout;

  // reset copied on id change
  $: copied = false && id;

  $: activeProfile = $activeAccountsById?.[_fwd_to]?.profile;
  $: relayAccountsSelectOptions = Object.values($activeAccountsById || []).map((acct) => ({ text: acct.email, value: acct.id }));

  $: canShare = !!(value && navigator.canShare && navigator.canShare({ text: value }));

  async function copyToClipboard() {
    if (value) {
      clearTimeout(copyTimeout);
      writeValueToClipboard(value);
      copied = true;
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 3000);
    }
  }

  async function shareOrCopy() {
    if (canShare) {
      await navigator.share({ text: value });
    } else {
      await copyToClipboard();
    }
  }

  async function toggleShowEditForm() {
    if (showEditForm) {
      // cancel changes
      _label = label;
      _note = note;
    }
    showEditForm = !showEditForm;
  }

  async function handleSubmit() {
    loading = true;
    try {
      if (editMode) {
        const editAddressResult = await editAddress({ id, label: _label, note: _note });
        console.log(editAddressResult, editAddressResult.headers);
        await handleAddressPatched({ id, label: _label, note: _note });
        showEditForm = false;
      } else {
        const createAddressResult = await createAddress({ label: _label, address: value, note: _note });
        console.log(createAddressResult, createAddressResult.headers);
        await handleNewAddressCreated(createAddressResult.data);
        newAddressSuggestion.set(null);
      }
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function loadStoredAddressSuggestion() {
    const { expires_at, ...suggestion } = $newAddressSuggestion || {};
    if (expires_at > Date.now()) {
      value = suggestion.address;
      return true;
    }
    return false;
  }

  async function generateAddress() {
    generatingAddress = true;
    try {
      const res = await newAddress();

      console.log(res.data);

      // store for next mount
      newAddressSuggestion.set({
        address: res.data.address,
        expires_at: Date.now() + 10 * 60_000
      });

      value = res.data.address;
    } finally {
      generatingAddress = false;
    }
  }

  async function handleFwdToChanged() {
    if (deactivated_at) return;
    activationChanging = true;
    try {
      // activate
      const res = await activateAddress({ id, ...(fwd_to !== _fwd_to && { fwd_to: _fwd_to }) });
      console.log(res, res.headers);
      await handleAddressPatched({ id, deactivated_at: undefined, bounce: undefined, fwd_to: _fwd_to });
    } catch (err) {
      /* do nothing */
      console.error(err);
      displayError(err);
    } finally {
      activationChanging = false;
    }
  }

  async function handleActivationToggle() {
    activationChanging = true;
    try {
      if (!deactivated_at) {
        // deactivate
        const res = await deactivateAddress({ id, mode: 'drop' });
        console.log(res, res.headers);
        await handleAddressPatched({ id, deactivated_at: Date.now() });
      } else {
        // activate
        const res = await activateAddress({ id, ...(fwd_to !== _fwd_to && { fwd_to: _fwd_to }) });
        console.log(res, res.headers);
        await handleAddressPatched({ id, deactivated_at: undefined, bounce: undefined, fwd_to: _fwd_to });
      }
    } catch (err) {
      /* do nothing */
      console.error(err);
      displayError(err);
    } finally {
      activationChanging = false;
    }
  }

  async function handleRejectIncomingMailToggle() {
    silentModeChanging = true;
    try {
      if (bounce) {
        // deactivate
        const res = await deactivateAddress({ id, mode: 'drop' });
        console.log(res, res.headers);
        await handleAddressPatched({ id, bounce: undefined });
      } else {
        // activate
        const res = await deactivateAddress({ id, mode: 'bounce' });
        console.log(res, res.headers);
        await handleAddressPatched({ id, bounce: true });
      }
    } catch (err) {
      /* do nothing */
      console.error(err);
      displayError(err);
    } finally {
      silentModeChanging = false;
    }
  }

  async function handleDeleteAddress() {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      loading = true;
      const res = await deleteAddress({ id });
      console.log(res, res.headers);
      await handleAddressDeleted({ id });
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    if (id) {
      if (created_at > Date.now() - 1000) {
        copyToClipboard();
      }
    } else {
      try {
        if (!loadStoredAddressSuggestion()) {
          await generateAddress();
        }
      } catch (err) {
        if (handleClose) handleClose();
        // throw err;
      }
    }
  });
</script>

<FlexContainer column height="calc(100vh - 82px)" gap="1rem" justify_content="space-between" align_items="center">
  <FlexContainer column gap="1rem" align_items="center">
    <FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale>
      <GridContainer template_columns="60px auto" gap="1rem">
        <FlexContainer width="auto" column textCentered gap="0.25rem">
          {#if logoHostname}
            {#await import(`../../../../../node_modules/@privacyportal/client-icons/dist/${logoHostname}.svelte`)}
              <Logo dimension="60px" color="var(--disabled-color)" opacity="1" portal animated />
            {:then Icon}
              <Icon.default dimension="60px" rounded deactivated={!!deactivated_at} />
            {:catch}
              <Logo dimension="60px" color={deactivated_at ? 'var(--disabled-color)' : 'var(--primary-color)'} opacity={'1'} />
              <h5 class="no-margin"><small>Mail Relay</small></h5>
            {/await}
          {:else}
            <Logo dimension="60px" color={deactivated_at ? 'var(--disabled-color)' : 'var(--primary-color)'} opacity={'1'} />
            <h5 class="no-margin"><small>Mail Relay</small></h5>
          {/if}
        </FlexContainer>
        <FlexContainer justify_content="flex-start" column gap="0.25rem">
          <h2 class="no-margin oneline">{(_label || 'Label').replace(/^https?:\/\/(\S+)/, '$1')}</h2>
          <span class="note">{_note || 'Privacy Portal Mail Relay Address.'}</span>
          {#if editMode}
            <FlexContainer align_items="flex-start" justify_content="space-between">
              {#if deactivated_at}
                <Tag margin="0.2rem 0 0 0" backgroundColor={bounce ? 'var(--danger-color)' : 'var(--warning-color)'} icon>
                  <OfflineBoltIcon dimension="13px" color="var(--color)" />
                  <small>{bounce ? 'Rejects Mail' : 'Silently Drops Mail'}</small>
                </Tag>
              {:else}
                <Tag margin="0.2rem 0 0 0" backgroundColor="var(--positive-color)" icon>
                  <CheckCircleIcon dimension="13px" color="var(--color)" />
                  <small>Forwards Mail</small>
                </Tag>
              {/if}
              {#if !showEditForm && !oauth_app_id}
                <Button on:click={toggleShowEditForm} height="auto" padding="0.1rem 0.4rem" gap="0.3rem" border rounded>
                  <EditIcon dimension="15px" />
                  <h5 class="no-margin"><small>Edit Info</small></h5>
                </Button>
              {/if}
            </FlexContainer>
          {/if}
        </FlexContainer>
      </GridContainer>
      {#if !editMode || showEditForm}
        <Form on:submit={handleSubmit}>
          <FlexContainer padding="0.5rem" bgColor="var(--new-layer-color)" width="auto" column textCentered gap="0.25rem" rounded>
            {#if editMode}
              <FlexContainer margin="0 0 0.2rem 0" align_items="center" justify_content="space-between">
                <h5 class="no-margin">Edit Info</h5>
                <Button height="auto" on:click={toggleShowEditForm} blendin rounded>
                  <CloseIcon />
                </Button>
              </FlexContainer>
            {/if}
            <InputLabel>
              <LabelIcon slot="icon" />
              <Input slot="input" type="text" name="label" placeholder="Label Your Address" autocomplete="off" maxlength={MAX_LABEL_LENGTH} bind:value={_label} icon disabled={loading} focus />
            </InputLabel>
            <InputLabel>
              <DescriptionIcon slot="icon" />
              <Input slot="input" type="text" name="note" required={false} placeholder="Note" autocomplete="off" maxlength={MAX_NOTE_LENGTH} bind:value={_note} icon disabled={loading} />
            </InputLabel>
            {#if !editMode}
              <Button type="submit" disabled={loading} primary="true" rounded>Create Address</Button>
            {:else if dirty}
              <Button type="submit" disabled={loading} primary="true" rounded>Save</Button>
            {/if}
          </FlexContainer>
        </Form>
      {/if}
      <hr class="no-margin divider" />
      <FlexContainer align_items="center" justify_content="space-between">
        <h4 class="no-margin">Privacy Address</h4>
        {#if editMode}
          {#if $isEnhancedProtection && activeProfile}
            <Tag backgroundColor={deactivated_at ? 'var(--disabled-color)' : 'var(--positive-color)'} padding="0.1rem 0.2rem">
              <LockIcon dimension="13px" color="var(--color)" />
              <small>{activeProfile.type === 'pgp' ? 'PGP' : 'S/MIME'}</small>
            </Tag>
          {:else}
            <Tag backgroundColor={deactivated_at ? 'var(--disabled-color)' : 'var(--warning-color)'} padding="0.1rem 0.2rem">
              <NoEncryptionIcon dimension="13px" color="var(--color)" />
              <small>TLS only</small>
            </Tag>
          {/if}
        {/if}
      </FlexContainer>
      <FlexContainer column gap="0.2rem" align_items="center">
        <Button width="100%" on:click={copyToClipboard} padding="0px 0.5rem" rounded>
          <GridContainer height="35px" width="100%" template_columns="1fr auto" align_items="center" justify_items="flex-start" gap="0.1rem">
            <span id="privacy-addr" class="oneline mono" style:--text-length={(value || '-').length}>{value || '-'}</span>
            {#if copied}
              <span class="note">copied</span>
            {:else}
              <CopyIcon dimension="16px" />
            {/if}
          </GridContainer>
        </Button>
        {#if !editMode && $isEnhancedProtection}
          <Button on:click={generateAddress} height="auto" width="fit-content" padding="0.1rem" disabled={loading} blendin rounded xsmall>change address</Button>
        {/if}
      </FlexContainer>
      <GridContainer template_columns="18px auto" align_items="center" margin={editMode ? '0.5rem 0 0 0' : '0'} gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">
          {!deactivated_at ? 'Emails' : 'When activated, emails'} sent to this address get forwarded to your personal email.
        </span>
      </GridContainer>
      {#if editMode}
        <hr class="no-margin divider" />
        <FlexContainer
          column
          align_items="flex-start"
          bgColor="var(--new-layer-color)"
          padding="0.5rem"
          gap={!deactivated_at || relayAccountsSelectOptions.length < 2 ? '0.1rem' : '0.3rem'}
          rounded
          autooverflow
        >
          <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
            <h5 class="no-margin">Forward to</h5>
            <Toggle on:click={handleActivationToggle} size="13px" checked={!deactivated_at} disabled={activationChanging} />
          </FlexContainer>
          {#if relayAccountsSelectOptions.length < 2}
            <span class="xs oneline">{$activeAccountsById?.[fwd_to]?.email}</span>
          {:else}
            <Select height="25px" on:change={handleFwdToChanged} bind:value={_fwd_to} options={relayAccountsSelectOptions} disabled={activationChanging} />
          {/if}

          {#if !oauth_app_id && $isEnhancedProtection && deactivated_at}
            <FlexContainer column bgColor="var(--new-layer-color)" margin="0.5rem 0 0 0" padding="0.5rem" gap="0.5rem" rounded>
              <FlexContainer align_items="center" justify_content="space-between">
                <h6 class="no-margin">Reject Incoming Mail</h6>
                <Toggle on:click={handleRejectIncomingMailToggle} size="12px" checked={bounce} disabled={silentModeChanging} danger />
              </FlexContainer>
              <span class="note"
                >When enabled, senders would receive delivery errors when attempting to reach this address. This could get your address automatically unsubscribed from mailing lists.</span
              >
            </FlexContainer>
          {/if}
        </FlexContainer>

        {#if !oauth_app_id && deactivated_at}
          <hr class="no-margin divider" />
          <Button on:click={handleDeleteAddress} margin="0.3rem 0 0 0" disabled={loading} danger rounded><small>Delete Address</small></Button>
          <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
            <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
            <span class="note">Deleted addresses cannot be recovered.</span>
          </GridContainer>
        {/if}
      {/if}
    </FlexContainer>

    {#if editMode}
      {#if !$isEnhancedProtection && !deactivated_at}
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
      {:else if $isEnhancedProtection && !deactivated_at && !oauth_app_id}
        <NewRecipient {id} acct_id={fwd_to} privacyAddress={value} />
      {/if}
    {/if}
  </FlexContainer>

  {#if editMode && canShare}
    <FlexContainer column padding="0 0 1rem 0">
      <Button on:click={shareOrCopy} width="100%" padding="0.3rem" disabled={loading} basic rounded><ShareIcon color="var(--color)" dimension="16px" /><small>Share Address</small></Button>
    </FlexContainer>
  {/if}
</FlexContainer>

<style>
  span#privacy-addr {
    max-width: 100%;
    font-size: min(1rem, calc(100cqw * 1.25 / var(--text-length)));
  }

  span.note {
    font-size: x-small;
    filter: brightness(150%);
  }

  .oneline {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
