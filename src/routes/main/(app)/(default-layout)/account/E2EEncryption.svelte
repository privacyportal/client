<script>
  import AddIcon from '$lib/components/materialIcons/AddIcon.svelte';
  import PassKeyIcon from '$lib/components/materialIcons/PassKeyIcon.svelte';
  import PasswordIcon from '$lib/components/materialIcons/PasswordIcon.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Tag from '$lib/components/common/Tag.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CancelIcon from '$lib/components/materialIcons/CancelIcon.svelte';
  import CheckCircleIcon from '$lib/components/materialIcons/CheckCircleIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import EditIcon from '$lib/components/materialIcons/EditIcon.svelte';
  import { session } from '$lib/stores/account';
  import { setupE2EE, addE2EEKeyWithPasskey, updateE2EESetup, updateE2EESetupWithPasskey } from '$lib/modules/crypto/e2eeUtil';
  import { deleteE2EEKey, getE2EEKeys } from '$lib/modules/requests';
  import { displayError } from '$lib/modules/errors';
  import { onMount } from 'svelte';
  import PwdStrengthGauge from '$lib/components/common/PwdStrengthGauge.svelte';

  export let isE2eeRequiredPage = false;

  let loadingKeys = true;
  let submittingEncryptionSettings = false;
  let editPasswordModalOpened = false;
  let mkeys;
  let selectedPassKey;
  let retypedPwdInput;
  let _old_password, _password, _retyped_password, _password_strength;

  $: enabled_passkeys = (mkeys ?? []).filter((item) => item.id && item.ct);

  $: if (!editPasswordModalOpened) resetInputs();
  $: if (!selectedPassKey) resetInputs();

  function resetInputs() {
    _old_password = _password = _retyped_password = undefined;
  }

  function pwdModifier(password) {
    return `${$session.sub}.${password}`;
  }

  async function submitEncryptionSettings(event) {
    try {
      submittingEncryptionSettings = true;
      if ($session.e2ee) {
        if (event.submitter.name === 'passkey') {
          const mkey = await updateE2EESetupWithPasskey($session.sub, pwdModifier(_password));
          mkeys = mkeys.map((key, index) => (index === 0 ? Object.assign({}, key, mkey) : key));
        } else {
          const mkey = await updateE2EESetup($session.sub, mkeys[0], pwdModifier(_old_password), pwdModifier(_password));
          mkeys = mkeys.map((key, index) => (index === 0 ? Object.assign({}, key, mkey) : key));
        }
      } else {
        const mkey = await setupE2EE($session.sub, pwdModifier(_password));
        mkeys = mkeys.map((key, index) => (index === 0 ? Object.assign({}, key, mkey) : key));

        // fetch eligible passkeys
        await fetchEncryptionKeys();
      }
      editPasswordModalOpened = false;
    } catch (err) {
      displayError(err);
    } finally {
      submittingEncryptionSettings = false;
    }
  }

  async function enableEncryptionWithPassKey() {
    try {
      submittingEncryptionSettings = true;
      const mkey = await addE2EEKeyWithPasskey($session.sub, pwdModifier(_password), mkeys[0], enabled_passkeys, selectedPassKey?.id);
      mkeys = mkeys.map((key) => (key?.id === mkey.id ? Object.assign({}, key, mkey) : key));
      selectedPassKey = undefined;
    } catch (err) {
      displayError(err);
    } finally {
      submittingEncryptionSettings = false;
    }
  }

  async function disableEncryptionWithPasskey() {
    try {
      submittingEncryptionSettings = true;
      await deleteE2EEKey({ passkey_id: selectedPassKey?.id });
      mkeys = mkeys.map((key) => (key?.id === selectedPassKey?.id ? Object.assign({}, key, { ct: undefined, salt: undefined }) : key));
      selectedPassKey = undefined;
    } catch (err) {
      displayError(err);
    } finally {
      submittingEncryptionSettings = false;
    }
  }

  async function fetchEncryptionKeys() {
    loadingKeys = true;
    try {
      const res = await getE2EEKeys();
      mkeys = res.data;
    } catch (err) {
      displayError(err);
    } finally {
      loadingKeys = false;
    }
  }

  onMount(fetchEncryptionKeys);
</script>

<Modal bind:open={editPasswordModalOpened} header minWidth="300px" maxWidth="500px">
  <FlexContainer column height="100%" gap="0.5rem">
    <FlexContainer align_items="center" justify_content="space-between">
      <h4 class="no-margin oneline">Password Configuration</h4>
      <Button
        margin="auto -0.25rem auto auto"
        on:click={() => {
          editPasswordModalOpened = false;
        }}
        height="auto"
        blendin
        light
        rounded
      >
        <CloseIcon />
      </Button>
    </FlexContainer>
    <span class="sm">Create a strong password to encrypt your data.</span>
    <Form on:submit={submitEncryptionSettings}>
      <FlexContainer column gap="0.5rem" padding="0.5rem 0">
        <FlexContainer column gap="0.15rem">
          <Input
            type="password"
            validateFn={() => (!_password_strength || _password_strength < 2 ? 'Password Too Weak' : '')}
            required={true}
            disabled={submittingEncryptionSettings}
            bind:value={_password}
          />
          <FlexContainer align_items="center" justify_content="space-between" gap="0.5rem">
            <span class="xs">New Password</span>
            {#if _password}
              <PwdStrengthGauge password={_password} bind:strength={_password_strength} />
            {/if}
          </FlexContainer>
        </FlexContainer>

        <FlexContainer column gap="0.15rem">
          <Input
            bind:inputElement={retypedPwdInput}
            type="password"
            validateFn={() => (_retyped_password !== _password ? "Passwords don't match" : '')}
            required={true}
            disabled={submittingEncryptionSettings}
            bind:value={_retyped_password}
            danger={_retyped_password && _retyped_password !== _password}
          />
          <span class="xs">Re-type New Password</span>
        </FlexContainer>

        {#if _password && _retyped_password}
          {#if $session?.e2ee}
            <FlexContainer column gap="0.15rem">
              <GridContainer align_items="center" template_columns={$session.e2ee === 2 ? '1fr auto auto' : '1fr'} gap="0.5rem">
                <Input type="password" required={false} disabled={submittingEncryptionSettings} bind:value={_old_password} />
                {#if $session.e2ee === 2}
                  <span class="xs">or</span>
                  <Button type="submit" name="passkey" padding="0px 0.2rem" disabled={submittingEncryptionSettings || _password !== _retyped_password} blendin rounded border>
                    <FlexContainer align_items="center" color="inherit" gap="0.2rem">
                      <PassKeyIcon dimension="20px" disabled={submittingEncryptionSettings || _password !== _retyped_password} />
                      <span class="xs">Passkey</span>
                    </FlexContainer>
                  </Button>
                {/if}
              </GridContainer>
              <span class="xs">Password</span>
            </FlexContainer>
          {/if}
          {#if !$session?.e2ee || _old_password}
            <GridContainer template_columns="1fr 1fr" align_items="center" justify_items="stretch" gap="0.5rem">
              <Button
                on:click={() => {
                  editPasswordModalOpened = false;
                }}
                width="100%"
                height="100%"
                padding="0.5rem 0"
                basic
                border
                rounded
                disabled={submittingEncryptionSettings}
                xsmall>Cancel</Button
              >
              <Button type="submit" name="pwd" width="100%" height="100%" padding="0.5rem 0" primary rounded disabled={submittingEncryptionSettings || _password !== _retyped_password} xsmall
                >{$session?.e2ee ? 'Update Password' : 'Configure Encryption'}</Button
              >
            </GridContainer>
          {/if}
        {/if}
      </FlexContainer>
    </Form>
    <GridContainer template_columns="18px auto" align_items="center" gap="0.5rem">
      <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
      <span class="note">Store your password securely. If you lose it, your data cannot be recovered.</span>
    </GridContainer>
  </FlexContainer>
</Modal>

<Modal bind:open={selectedPassKey} header minWidth="300px" maxWidth="500px">
  <FlexContainer column height="100%" gap="0.5rem">
    <FlexContainer align_items="center" justify_content="space-between">
      <h4 class="no-margin oneline">End-to-End Encryption With Passkey</h4>
      <Button
        margin="auto -0.25rem auto auto"
        on:click={() => {
          selectedPassKey = undefined;
        }}
        height="auto"
        blendin
        light
        rounded
      >
        <CloseIcon />
      </Button>
    </FlexContainer>
    {#if selectedPassKey.enabled}
      <span class="sm">This Passkey is configured for end-to-end encryption and provides password-free sign-in.</span>
      <Form on:submit={disableEncryptionWithPasskey}>
        <FlexContainer column gap="0.5rem" padding="0.5rem 0 0 0">
          <GridContainer template_columns="1fr 1fr" align_items="center" justify_items="stretch" gap="0.5rem">
            <Button
              on:click={() => {
                selectedPassKey = undefined;
              }}
              width="100%"
              height="100%"
              padding="0.5rem 0"
              basic
              border
              rounded
              disabled={submittingEncryptionSettings}
              xsmall>Cancel</Button
            >
            <Button type="submit" width="100%" height="100%" padding="0.5rem 0" danger rounded disabled={submittingEncryptionSettings} xsmall>Disable E2EE with Passkey</Button>
          </GridContainer>
        </FlexContainer>
      </Form>
    {:else}
      <span class="sm">Access your encrypted data seamlessly, without entering a password.</span>
      <Form on:submit={enableEncryptionWithPassKey}>
        <FlexContainer column gap="0.5rem" padding="0.5rem 0 0 0">
          <Input type="password" placeholder="Password" minlength="8" required={true} disabled={submittingEncryptionSettings} bind:value={_password} />
          <GridContainer template_columns="1fr 1fr" align_items="center" justify_items="stretch" gap="0.5rem" padding="0.5rem 0 0 0">
            <Button
              on:click={() => {
                selectedPassKey = undefined;
              }}
              width="100%"
              height="100%"
              padding="0.5rem 0"
              basic
              border
              rounded
              disabled={submittingEncryptionSettings}
              xsmall>Cancel</Button
            >
            <Button type="submit" width="100%" height="100%" padding="0.5rem 0" primary rounded disabled={submittingEncryptionSettings} xsmall>Configure</Button>
          </GridContainer>
        </FlexContainer>
      </Form>
      <GridContainer template_columns="18px auto" align_items="center" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">You'll need your password when using Passkeys without end-to-end encryption enabled. Your password also serves as your data recovery method.</span>
      </GridContainer>
    {/if}
  </FlexContainer>
</Modal>

<FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
  <h4 class="no-margin">End-to-End Encryption</h4>
  <span class="sm"
    >{isE2eeRequiredPage
      ? 'This feature requires end-to-end encryption to be enabled.'
      : 'Your data is encrypted on your device with zero-knowledge encryption, meaning we never have access to it.'}</span
  >

  <FlexContainer column gap="1rem">
    {#if !$session.e2ee}
      <Button
        on:click={() => {
          editPasswordModalOpened = true;
        }}
        margin="0.5rem 0px"
        primary
        rounded
      >
        Enable E2EE
      </Button>
    {:else if !loadingKeys}
      <GridContainer align_items="center" template_columns="auto 1fr auto auto" bgColor="var(--new-layer-color)" gap="0.5rem" margin="0.5rem 0px 0px 0px" rounded padding="0.5rem">
        <h6 class="no-margin oneline grid-span-2">Encryption Key</h6>
        <h6 class="no-margin oneline text-centered">Status</h6>
        <h6 class="no-margin oneline text-centered">Action</h6>
        <div class="gridline" />
        <PasswordIcon dimension="20px" />
        <span class="sm oneline">Password</span>
        <Tag backgroundColor="var(--positive-color)" icon>
          <CheckCircleIcon dimension="15px" color="var(--icon-color)" />
          <small>Required</small>
        </Tag>
        <Button
          on:click={() => {
            editPasswordModalOpened = true;
          }}
          height="auto"
          padding="3px"
          margin="0px"
          gap="0.2rem"
          xsmall
          blendin
          border
          rounded
        >
          <EditIcon dimension="15px" /> Edit
        </Button>
        {#each mkeys as { id, label, ct }}
          {#if id}
            {#if ct}
              <PassKeyIcon dimension="20px" />
              <span class="sm oneline">PassKey - {label}</span>
              <Tag backgroundColor="var(--positive-color)" icon>
                <CheckCircleIcon dimension="15px" color="var(--icon-color)" />
                <small>Enabled</small>
              </Tag>
              <Button
                on:click={() => {
                  selectedPassKey = { id, enabled: true };
                }}
                height="auto"
                padding="3px"
                margin="0px"
                gap="0.2rem"
                xsmall
                blendin
                border
                rounded
              >
                <EditIcon dimension="15px" /> Edit
              </Button>
            {:else}
              <PassKeyIcon dimension="20px" />
              <span class="sm oneline">PassKey - {label}</span>
              <Tag backgroundColor="var(--disabled-color)" icon>
                <CancelIcon dimension="15px" color="var(--icon-color)" />
                <small>Disabled</small>
              </Tag>
              <Button
                on:click={() => {
                  selectedPassKey = { id, enabled: false };
                }}
                height="auto"
                padding="3px"
                margin="0px"
                gap="0.2rem"
                xsmall
                blendin
                border
                rounded
              >
                <AddIcon dimension="15px" /> Set up
              </Button>
            {/if}
          {/if}
        {/each}
      </GridContainer>

      <GridContainer template_columns="18px auto" align_items="center" gap="0.5rem">
        <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
        <span class="note">Certain account data cannot be end-to-end encrypted to ensure core service functionality.</span>
      </GridContainer>
    {:else}
      <span>Loading...</span>
    {/if}
  </FlexContainer>
</FlexContainer>
