<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Form from '$lib/components/common/Form.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Select from '$lib/components/common/Select.svelte';
  import DownloadIcon from '$lib/components/materialIcons/DownloadIcon.svelte';
  import DownloadingIcon from '$lib/components/materialIcons/DownloadingIcon.svelte';
  import ShareIcon from '$lib/components/materialIcons/ShareIcon.svelte';
  import VerifiedIcon from '$lib/components/materialIcons/VerifiedIcon.svelte';
  import { ORGANIZATION, PROVIDER_URL } from '$lib/modules/constants';
  import { saveAs, createFile } from '$lib/modules/export';
  import { sessionRead } from '$lib/modules/storage';
  import { session } from '$lib/stores/account';
  import { addToCertificateState } from '$lib/stores/profiles';
  import { showSnackbar } from '$lib/stores/snackbar';
  import { onMount } from 'svelte';

  const ITERATION_OPTIONS = [
    { value: { iterations: 100000 }, text: 'Strongest Encryption (slowest)' },
    { value: { iterations: 50000 }, text: 'Strong Encryption (slow)' },
    { value: { iterations: 10000 }, text: 'Weak Encryption (fastest)' }
  ];

  export let profile;
  let passphrase;
  let encryptionOptions = ITERATION_OPTIONS[1].value;
  let exporting;
  let downloading;
  let exportedFile;

  $: canShare = !!(exportedFile && navigator.canShare && navigator.canShare({ files: [ exportedFile ] }));

  async function exportCertificate(type) {
    const email = $session?.email;

    exporting = true;
    addToCertificateState(profile.id, { isExporting: true });
    const { privateKey } = sessionRead(profile.id);
    // console.log('certificate', certificate);
    // console.log('privateKey:', privateKey);
    if (!profile || !profile.pem || !privateKey) throw new Error('Certificate data not found.');

    const pkcs12Worker = new Worker(new URL('../../../../../lib/modules/pki/PKCS12Worker.js', import.meta.url), { type: 'module' });

    try {
      const pkcs12Data = await new Promise((resolve, reject) => {
        pkcs12Worker.onerror = reject;
        pkcs12Worker.onmessage = function (event) {
          if (!event.data) return reject(new Error('empty reponse from worker'));
          resolve(event.data.pkcs12_data);
        };

        pkcs12Worker.postMessage({
          providerName: ORGANIZATION,
          providerURL: PROVIDER_URL,
          ...encryptionOptions,
          passphrase,
          privateKey,
          chain: type == 'ios' ? [profile.pem] : [profile.pem, profile.issuer_pem, profile.root_pem]
        });
      });

      exportedFile = createFile({
        filename: `${email}.pfx`,
        data: pkcs12Data,
        type: 'application/x-pkcs12'
      });

      saveAs({ file: exportedFile });

      showSnackbar({ text: 'Certificate successfully exported.' });
    } catch (err) {
      console.error(err);
      showSnackbar({ text: 'Certificate export failed.' });
      showSnackbar({ text: err.message });
    } finally {
      passphrase = '';
      exporting = false;
      addToCertificateState(profile.id, { isExporting: false });
      pkcs12Worker.terminate();
    }
  }

  function handleDownload() {
    downloading = true;
    try {
      saveAs({ file: exportedFile });
    } finally {
      downloading = false;
    }
  }

  async function handleShare() {
    if (canShare) {
      downloading = true;
      try {
        await navigator.share({
          files: [ exportedFile ]
        });
      } finally {
        downloading = false;
      }
    }
  }

  onMount(() => {
    passphrase = '';
    exporting = false;
  });
</script>

<FlexContainer column gap="0.5rem">
  <FlexContainer gap="0.5rem" align_items="center">
    <h5 class="no-margin">Export Certificate</h5>
  </FlexContainer>

  {#if exportedFile}
    <span class="sm"> Make sure to backup this profile now for recovery purposes. You would also need it to setup email encryption on other devices you own. </span>
    <FlexContainer column bgColor="var(--new-layer-color)" padding="0.5rem" gap="0.5rem" rounded>
      <GridContainer align_items="center" template_columns="20px 1fr" gap="0.5rem" rounded>
        <VerifiedIcon dimension="20px" />
        <FlexContainer column>
          <h6 class="no-margin">S/MIME profile</h6>
          <span class="xs oneline">{exportedFile.name}</span>
        </FlexContainer>
      </GridContainer>
      <GridContainer template_columns={`repeat(${canShare ? 2 : 1}, 1fr)`} mobile_template_columns="1fr" gap="0.3rem">
        <Button height="auto" margin="0" padding="0.2rem 0.5rem" gap="0.3rem" on:click={handleDownload} disabled={downloading} blendin border rounded>
          <DownloadIcon dimension="18px" />
          <span class="xs"><strong>Download</strong></span>
        </Button>
        {#if canShare}
          <Button height="auto" margin="0" padding="0.2rem 0.5rem" gap="0.3rem" on:click={handleShare} disabled={downloading} blendin border rounded>
            <ShareIcon dimension="18px" />
            <span class="xs"><strong>Share</strong></span>
          </Button>
        {/if}
      </GridContainer>
    </FlexContainer>
  {:else}
    <span class="sm"> Enter a passphrase to encrypt and export your certificate and private key. The exported file needs be installed on your devices to setup email encryption. </span>

    <Form on:submit={exportCertificate} width="100%">
      <FlexContainer column gap="0.5rem">
        <Input type="password" placeholder="Insert Passphrase" minlength="8" pattern="^\S.*\S$" bind:value={passphrase} disabled={exporting} />
        <Select bind:value={encryptionOptions} options={ITERATION_OPTIONS} disabled={exporting} />
        <Button padding="0.5rem 0" type="submit" primary rounded disabled={exporting}>
          {#if exporting}
            <DownloadingIcon color="var(--disabled-color)" /> Exporting...
          {:else}
            <DownloadIcon color="var(--color)" />Export
          {/if}
        </Button>
      </FlexContainer>
    </Form>
  {/if}
</FlexContainer>
