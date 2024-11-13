<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Section from '$lib/components/common/Section.svelte';
  import Logo from '$lib/components/svg/Logo.svelte';
  import { base64ToBuffer, base64ToString, bufferToBase64, bufferToUUID } from '$lib/modules/auth';
  import { registerAuthenticator } from '$lib/modules/requests';
  import { endSession, isDarkMode } from '$lib/stores/account';
  import { showSnackbar } from '$lib/stores/snackbar';
  import { onMount } from 'svelte';

  let submitting = false;
  let loading = true;
  let registered = false;
  let label;
  let id;
  let credentialCreationOptions;

  async function registerDevice() {
    try {
      submitting = true;

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
      registered = true;
    } finally {
      submitting = false;
    }
  }

  async function parseChallengeInfo() {
    try {
      loading = true;
      const input = $page.url.searchParams.get('i');
      if (!input) throw new Error('Input missing');

      const attestation_opts = JSON.parse(base64ToString(input));

      if (attestation_opts) {
        // base64 id
        id = bufferToUUID(base64ToBuffer(attestation_opts.user.id));

        // formatted credential creation options
        attestation_opts.challenge = base64ToBuffer(attestation_opts.challenge);
        attestation_opts.user.id = base64ToBuffer(attestation_opts.user.id);
        credentialCreationOptions = attestation_opts;
      }
    } catch (err) {
      console.error(err);
      showSnackbar({ text: 'Invalid or expired device registration url.' });
      // redirect to main page
      setTimeout(() => goto('/', { replaceState: true }), 3000);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    endSession(false);
    await parseChallengeInfo();
  });
</script>

<Section padding="0px 1rem" height="calc(100vh - 50px)" bgColor={$isDarkMode ? 'var(--outer-bg-color)' : 'var(--primary-color)'} color="var(--primary-text-color)" textCentered>
  <FlexContainer column color="inherit" gap="2rem" width="auto">
    <div>
      <Logo dimension="12rem" color="var(--primary-color)" opacity="1" />

      <h2>Privacy Portal</h2>
    </div>

    {#if registered}
      <p>Your new device has been registered. Please activate it from one of your trusted devices.</p>
    {:else if loading}
      <p>Loading...</p>
    {:else if !!credentialCreationOptions}
      <FlexContainer column gap="1.5rem">
        <Form on:submit={registerDevice}>
          <FlexContainer column gap="0.5rem">
            <Input type="text" name="label" placeholder="Label" bind:value={label} disabled={submitting} />
            <Button type="submit" disabled={submitting} rounded border={$isDarkMode}>Register Device</Button>
          </FlexContainer>
        </Form>
      </FlexContainer>
    {/if}
  </FlexContainer>
</Section>

<style>
</style>
