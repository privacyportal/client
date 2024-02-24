<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import QrCode from '$lib/components/common/QrCode.svelte';
  import Radio from '$lib/components/common/Radio.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import CopyIcon from '$lib/components/materialIcons/CopyIcon.svelte';
  import { base64ToBuffer, bufferToBase64, bufferToUUID, stringToBase64 } from '$lib/modules/auth';
  import { getNewAuthenticatorChallenge, registerAuthenticator } from '$lib/modules/requests';
  import { writeValueToClipboard } from '$lib/modules/utils';
  import { showSnackbar } from '$lib/stores/snackbar';
  import { onMount } from 'svelte';

  let loading = false;
  let newAuthenticatorOptions = [
    { label: 'Current Device', value: 'current' },
    { label: 'Other Device', value: 'other' }
  ];
  let selectedNewAuthenticatorType;
  let url;
  let id;
  let credentialCreationOptions;
  let label;
  let copied = false;
  let copyTimeout;

  export let done;
  export let cancel;

  async function copyToClipboard() {
    clearTimeout(copyTimeout);
    writeValueToClipboard(url);
    copied = true;
    copyTimeout = setTimeout(() => {
      copied = false;
    }, 3000);
  }

  async function getChallenge() {
    loading = true;

    try {
      const { data } = await getNewAuthenticatorChallenge();
      console.log(data);
      const { attestation_opts } = data;

      // write as url
      url = `${window.location.origin}/add-device?i=${stringToBase64(JSON.stringify(attestation_opts), { url: true })}`;

      // base64 id
      id = bufferToUUID(base64ToBuffer(attestation_opts.user.id));

      // formatted credential creation options
      attestation_opts.challenge = base64ToBuffer(attestation_opts.challenge);
      attestation_opts.user.id = base64ToBuffer(attestation_opts.user.id);
      credentialCreationOptions = attestation_opts;
    } finally {
      loading = false;
    }
  }

  async function registerDevice() {
    try {
      loading = true;

      const credential = await navigator.credentials.create({
        publicKey: credentialCreationOptions
      });

      await registerAuthenticator({
        id,
        label,
        credential: {
          id: credential.id,
          rawId: bufferToBase64(credential.rawId),
          response: {
            clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
            attestationObject: bufferToBase64(credential.response.attestationObject)
          }
        }
      });

      // authenticator registered successfully
      if (done) {
        showSnackbar({ text: 'Please activate your newly registered authenticator using one of your trusted authenticators.', ttl: 15000 });
        done();
      }
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await getChallenge();
  });
</script>

<FlexContainer column gap="0.5rem" padding="1rem 1rem 0.5rem 1rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin oneline">Register new authenticator</h3>
    <Button margin="auto -0.25rem auto auto" on:click={cancel} height="auto" blendin light rounded>
      <CloseIcon />
    </Button>
  </FlexContainer>
  <Radio margin="0.5rem 0 0 0" options={newAuthenticatorOptions} bind:selected={selectedNewAuthenticatorType} />
</FlexContainer>

<FlexContainer column gap="0.5rem" nooverflow padding="0px 1rem 1rem 1rem">
  {#if selectedNewAuthenticatorType === 'current'}
    <p class="sm-v-margin">To register, plug or connect your new authenticator to this device then click on "Register Authenticator".</p>
    <Form on:submit={registerDevice} width="100%">
      <FlexContainer column gap="0.5rem">
        <Input type="text" placeholder="Label" maxlength="50" bind:value={label} />
        <Button type="submit" primary rounded disabled={loading || !credentialCreationOptions}>Register Authenticator</Button>
      </FlexContainer>
    </Form>
  {:else}
    <p class="sm-v-margin"><small>To register, scan the QR code from the new device or copy the URL and open it on the new device's browser.</small></p>
    <div id="qr-code">
      <QrCode bind:value={url} />
    </div>
    <Button on:click={copyToClipboard} primary rounded disabled={loading || !url}>
      {#if copied}
        copied
      {:else}
        <CopyIcon color="var(--color)" /> Copy URL
      {/if}
    </Button>
  {/if}
</FlexContainer>

<style>
  #qr-code {
    width: 100%;
  }
</style>
