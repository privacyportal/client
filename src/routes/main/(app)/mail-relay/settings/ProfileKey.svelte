<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import AnnouncementIcon from '$lib/components/materialIcons/AnnouncementIcon.svelte';
  import CloseIcon from '$lib/components/materialIcons/CloseIcon.svelte';
  import DownloadIcon from '$lib/components/materialIcons/DownloadIcon.svelte';
  import DownloadingIcon from '$lib/components/materialIcons/DownloadingIcon.svelte';
  import saveAs from '$lib/modules/export';
  import { showSnackbar } from '$lib/stores/snackbar';
  import { minuteTimer } from '$lib/stores/timers';
  import { X509Certificate } from '@privacyportal/client-certs';

  export let profile;
  export let isUserKey;
  export let cancel;
  let downloadingTrustKey = false;
  let downloadingEndEntityCert = false;
  let downloadingIntermediateCert = false;
  let downloadingRootCert = false;

  $: intermediateCert = profile.type === 'smime' ? new X509Certificate(profile.issuer_pem) : null;
  $: rootCert = profile.type === 'smime' ? new X509Certificate(profile.root_pem) : null;
  $: isDisabled = (isUserKey && !profile.enabled) || profile.expires_at < $minuteTimer;

  function formatFingerprint(fingerprint, firstPart) {
    return fingerprint
      .substr(firstPart ? 0 : 20, 20)
      .toUpperCase()
      .match(/.{1,4}/g)
      .join(' ');
  }

  async function downloadTrustKey() {
    downloadingTrustKey = true;
    try {
      saveAs({
        filename: `publickey - sender@pportal.io - 0x${profile.mr_key_id.substr(0, 8).toUpperCase()}.asc`,
        data: profile.auth_pubkey,
        type: 'application/pgp-keys'
      });
    } catch (err) {
      showSnackbar({ text: 'Download failed. Please try again later.' });
      console.error(err);
    } finally {
      downloadingTrustKey = false;
    }
  }

  async function downloadEndEntityCert() {
    downloadingIntermediateCert = true;
    try {
      saveAs({
        filename: `${profile.email}.crt`,
        data: profile.pem,
        type: 'application/x-x509-ca-cert'
      });
    } catch (err) {
      showSnackbar({ text: 'Download failed. Please try again later.' });
      console.error(err);
    } finally {
      downloadingIntermediateCert = false;
    }
  }

  async function downloadIntermediateCert() {
    downloadingIntermediateCert = true;
    try {
      saveAs({
        filename: 'intermediate.crt',
        data: profile.issuer_pem,
        type: 'application/x-x509-ca-cert'
      });
    } catch (err) {
      showSnackbar({ text: 'Download failed. Please try again later.' });
      console.error(err);
    } finally {
      downloadingIntermediateCert = false;
    }
  }

  async function downloadRootCert() {
    downloadingRootCert = true;
    try {
      saveAs({
        filename: 'root.crt',
        data: profile.root_pem,
        type: 'application/x-x509-ca-cert'
      });
    } catch (err) {
      showSnackbar({ text: 'Download failed. Please try again later.' });
      console.error(err);
    } finally {
      downloadingRootCert = false;
    }
  }
</script>

<FlexContainer column height="100%" gap="0.5rem" padding="1rem 0rem 0.5rem 0rem">
  <FlexContainer align_items="center" justify_content="space-between" padding="0 1rem">
    <h4 class="no-margin oneline">{isUserKey ? 'User' : 'Relay'} {profile.type == 'pgp' ? 'PGP Key' : 'S/MIME Certificate'}</h4>
    <Button margin="auto -0.25rem auto auto" on:click={cancel} height="auto" blendin light rounded>
      <CloseIcon />
    </Button>
  </FlexContainer>

  <FlexContainer column height="100%" gap="0.5rem" padding="0.5rem 1rem" nooverflow>
    <GridContainer bgColor="var(--new-layer-color)" padding="0.5rem" template_columns="1fr" gap="0.5rem" rounded zeroFlexShrink>
      {#if isUserKey && profile.type === 'smime'}
        <FlexContainer align_items="center" justify_content="space-between">
          <h6 class="no-margin">End Entity Certificate</h6>
          <Button height="auto" margin="0" padding="0.1rem" on:click={downloadEndEntityCert} disabled={downloadingEndEntityCert} blendin rounded>
            {#if downloadingEndEntityCert}
              <DownloadingIcon dimension="18px" />
            {:else}
              <DownloadIcon dimension="18px" />
            {/if}
          </Button>
        </FlexContainer>
      {:else}
        <h6 class="no-margin">{profile.type === 'pgp' ? 'Public Key' : 'End Entity Certificate'}</h6>
      {/if}

      <hr class="divider no-margin" />
      <FlexContainer width="auto" color="auto" column>
        <span class="mono sm oneline" class:disabled={isDisabled}>{isUserKey ? profile.email : 'CORRESPONDENT RELAY ADDRESS'}</span>
        <FlexContainer align_items="center" gap="0.2rem">
          <span class="xs" class:disabled={isDisabled}><strong>email</strong></span>
        </FlexContainer>
      </FlexContainer>
      <FlexContainer width="100%" color="auto" column>
        {#if profile.type === 'pgp'}
          {#if isUserKey}
            <span class="mono sm oneline" class:disabled={isDisabled}>{formatFingerprint(profile.fingerprint, true)}</span>
            <span class="mono sm oneline" class:disabled={isDisabled}>{formatFingerprint(profile.fingerprint, false)}</span>
          {:else}
            <span class="mono sm oneline" class:disabled={isDisabled}>AUTO-GENERATED</span>
          {/if}
        {:else}
          <span class="mono sm oneline" class:disabled={isDisabled}>{isUserKey ? profile.serial : 'AUTO-GENERATED'}</span>
        {/if}
        <FlexContainer align_items="center" gap="0.2rem">
          <span class="xs" class:disabled={isDisabled}><strong>{profile.type === 'pgp' ? 'Fingerprint' : 'Serial Number'}</strong></span>
        </FlexContainer>
      </FlexContainer>
      {#if !isUserKey}
        <GridContainer template_columns="18px auto" align_items="center" margin="0 0 0 0" gap="0.5rem">
          <AnnouncementIcon color="var(--icon-color)" dimension="18px" />
          {#if profile.type === 'pgp'}
            <span class="note">All generated PGP keys are signed with the profile's Trust Key. Add the Trust key to you PGP key manager to quickly verify new keys.</span>
          {:else}
            <span class="note">All generated certificates are issued by the profile's Intermediate CA.</span>
          {/if}
        </GridContainer>
      {/if}
    </GridContainer>
    {#if profile.type === 'pgp'}
      {#if !isUserKey}
        <GridContainer bgColor="var(--new-layer-color)" padding="0.5rem" template_columns="1fr" gap="0.5rem" rounded zeroFlexShrink>
          <FlexContainer align_items="center" justify_content="space-between">
            <h6 class="no-margin">Trust Public Key</h6>
            <Button height="auto" margin="0" padding="0.1rem" on:click={downloadTrustKey} disabled={downloadingTrustKey} blendin rounded>
              {#if downloadingTrustKey}
                <DownloadingIcon dimension="18px" />
              {:else}
                <DownloadIcon dimension="18px" />
              {/if}
            </Button>
          </FlexContainer>
          <hr class="divider no-margin" />
          <FlexContainer width="100%" color="auto" column>
            <span class="mono sm oneline" class:disabled={isDisabled}>sender@pportal.io</span>
            <FlexContainer align_items="center" gap="0.2rem">
              <span class="xs" class:disabled={isDisabled}><strong>email</strong></span>
            </FlexContainer>
          </FlexContainer>
          <FlexContainer width="100%" color="auto" column>
            <span class="mono sm oneline" class:disabled={isDisabled}>{formatFingerprint(profile.mr_fingerprint, true)}</span>
            <span class="mono sm oneline" class:disabled={isDisabled}>{formatFingerprint(profile.mr_fingerprint, false)}</span>
            <FlexContainer align_items="center" gap="0.2rem">
              <span class="xs" class:disabled={isDisabled}><strong>Serial Number</strong></span>
            </FlexContainer>
          </FlexContainer>

          <FlexContainer width="100%" color="auto" column>
            <span class="mono sm oneline" class:disabled={isDisabled}>0x{profile.mr_key_id.toUpperCase()}</span>
            <FlexContainer align_items="center" gap="0.2rem">
              <span class="xs" class:disabled={isDisabled}><strong>Key ID</strong></span>
            </FlexContainer>
          </FlexContainer>
        </GridContainer>
      {/if}
    {:else}
      <GridContainer bgColor="var(--new-layer-color)" padding="0.5rem" template_columns="1fr" gap="0.5rem" rounded zeroFlexShrink>
        <FlexContainer align_items="center" justify_content="space-between">
          <h6 class="no-margin">Intermediate CA Certificate</h6>
          <Button height="auto" margin="0" padding="0.1rem" on:click={downloadIntermediateCert} disabled={downloadingIntermediateCert} blendin rounded>
            {#if downloadingIntermediateCert}
              <DownloadingIcon dimension="18px" />
            {:else}
              <DownloadIcon dimension="18px" />
            {/if}
          </Button>
        </FlexContainer>
        <hr class="divider no-margin" />
        <FlexContainer width="100%" color="auto" column>
          <span class="mono sm oneline" class:disabled={isDisabled}>{intermediateCert.serialNumber}</span>
          <FlexContainer align_items="center" gap="0.2rem">
            <span class="xs" class:disabled={isDisabled}><strong>Serial Number</strong></span>
          </FlexContainer>
        </FlexContainer>
      </GridContainer>
      <GridContainer bgColor="var(--new-layer-color)" padding="0.5rem" template_columns="1fr" gap="0.5rem" rounded zeroFlexShrink>
        <FlexContainer align_items="center" justify_content="space-between">
          <h6 class="no-margin">Root CA Certificate</h6>
          <Button height="auto" margin="0" padding="0.1rem" on:click={downloadRootCert} disabled={downloadingRootCert} blendin rounded>
            {#if downloadingRootCert}
              <DownloadingIcon dimension="18px" />
            {:else}
              <DownloadIcon dimension="18px" />
            {/if}
          </Button>
        </FlexContainer>
        <hr class="divider no-margin" />
        <FlexContainer width="100%" color="auto" column>
          <span class="mono sm oneline" class:disabled={isDisabled}>{rootCert.serialNumber}</span>
          <FlexContainer align_items="center" gap="0.2rem">
            <span class="xs" class:disabled={isDisabled}><strong>Serial Number</strong></span>
          </FlexContainer>
        </FlexContainer>
      </GridContainer>
    {/if}
  </FlexContainer>
</FlexContainer>
