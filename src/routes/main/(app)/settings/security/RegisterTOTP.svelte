<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import QrCode from '$lib/components/common/QrCode.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import CopyIcon from '$lib/components/materialIcons/CopyIcon.svelte';
  import { getEmailRecoveryTotpURI, registerEmailRecoveryTotp } from '$lib/modules/requests';
  import { writeValueToClipboard } from '$lib/modules/utils';
  import { onMount } from 'svelte';

  export let cancel;
  export let done;

  let loading = true;
  let url;
  let copied = false;
  let copyTimeout;
  let submitting;
  let token;

  let progressIndex = 0;
  let scrollableContainer;

  function nextStep() {
    progressIndex++;
    scrollableContainer.scrollTop = 0;
  }

  async function copyToClipboard() {
    clearTimeout(copyTimeout);
    writeValueToClipboard(url);
    copied = true;
    copyTimeout = setTimeout(() => {
      copied = false;
    }, 3000);
  }

  async function fetchTotpURI() {
    try {
      loading = true;
      const res = await getEmailRecoveryTotpURI();
      url = res.data.uri;
    } finally {
      loading = false;
    }
  }

  async function enable2FA() {
    try {
      submitting = true;
      await registerEmailRecoveryTotp({ token });
      done();
    } catch (err) {
      submitting = false;
    }
  }

  function reset() {
    progressIndex = 0;
  }

  onMount(fetchTotpURI);
</script>

<FlexContainer column gap="0.5rem" padding="1rem 1rem 0.5rem 1rem">
  <FlexContainer align_items="center" justify_content="space-between">
    <h3 class="no-margin oneline">Setup 2FA</h3>
    <Button
      margin="auto -0.25rem auto auto"
      on:click={() => {
        reset();
        cancel();
      }}
      height="auto"
      blendin
      light
      rounded
    >
      <CloseIcon />
    </Button>
  </FlexContainer>
</FlexContainer>

<Form on:submit={enable2FA} width="100%">
  <FlexContainer column gap="0.5rem" nooverflow padding="0px 1rem 1rem 1rem">
    {#if progressIndex === 0}
      <p class="sm-v-margin"><small>To register, scan the QR code from the TOTP app of your choice.</small></p>
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
      <Button on:click={nextStep} padding="0.5rem 0" basic rounded>Continue</Button>
    {:else}
      <Input type="text" name="token" minlength="6" maxlength="6" pattern="[0-9]+" placeholder="Insert Token" autocomplete="off" focus={true} bind:value={token} disabled={submitting} />
      <Button type="submit" primary rounded disabled={submitting}>Enable 2FA</Button>
    {/if}
  </FlexContainer>
</Form>

<style>
  #qr-code {
    width: 100%;
  }
</style>
