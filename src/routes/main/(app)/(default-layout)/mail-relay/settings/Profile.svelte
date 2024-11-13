<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Toggle from '$lib/components/common/Toggle.svelte';
  import DeleteIcon from '$lib/components/materialIcons/DeleteIcon.svelte';
  import KeyIcon from '$lib/components/materialIcons/KeyIcon.svelte';
  import OfflineBoltIcon from '$lib/components/materialIcons/OfflineBoltIcon.svelte';
  import VerifiedIcon from '$lib/components/materialIcons/VerifiedIcon.svelte';
  import { displayError } from '$lib/modules/errors';
  import { activateProfile, deactivateProfile, deleteProfile } from '$lib/modules/requests';
  import { formatDate, formatDuration } from '$lib/modules/utils';
  import { profiles as profilesStore } from '$lib/stores/profiles';
  import { minuteTimer } from '$lib/stores/timers';
  import ProfileKey from './ProfileKey.svelte';

  export let profile;

  let loading = false;
  let modalOpened = false;
  $: expired = profile.expires_at < $minuteTimer;

  async function handleDeleteProfile() {
    loading = true;
    try {
      if (confirm('Are you sure you want to delete this profile? You will no longer be able to reply to emails encrypted with this profile.')) {
        await deleteProfile({ accountId: profile.acct_id, id: profile.id });
        profilesStore.update((profilesArr) => profilesArr.filter((p) => p.id !== profile.id));
      }
    } catch (err) {
      /* do nothing */
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function handleActivationToggle() {
    loading = true;
    try {
      if (profile.enabled) {
        // deactivate
        await deactivateProfile({ accountId: profile.acct_id, id: profile.id });
        profilesStore.update((profilesArr) => {
          return profilesArr.map((p) => (p.id === profile.id ? Object.assign(p, { enabled: undefined }) : p));
        });
      } else {
        // activate
        await activateProfile({ accountId: profile.acct_id, id: profile.id });
        profilesStore.update((profilesArr) => {
          return profilesArr.map((p) => (p.id === profile.id || p.enabled === true ? Object.assign(p, { enabled: p.id === profile.id }) : p));
        });
      }
    } catch (err) {
      /* do nothing */
      console.error(err);
      displayError(err);
    } finally {
      loading = false;
    }
  }
</script>

<Modal bind:open={modalOpened} header minWidth="300px" maxWidth="400px" padding="0px">
  <ProfileKey {profile} isUserKey={modalOpened.isUserKey} cancel={() => (modalOpened = false)} />
</Modal>

<div class="two-rows">
  <FlexContainer width="auto" column align_items="center" gap="0px">
    <h6 class="no-margin"><small>{profile.type === 'pgp' ? 'PGP' : 'S/MIME'}</small></h6>
    {#if profile.type === 'pgp'}
      <KeyIcon dimension="15px" color={expired ? 'var(--danger-color)' : 'var(--info-color)'} />
    {:else}
      <VerifiedIcon dimension="15px" color={expired ? 'var(--danger-color)' : 'var(--positive-color)'} />
    {/if}
  </FlexContainer>
</div>
<button
  class="key"
  on:click={() => {
    modalOpened = { isUserKey: true };
  }}
>
  <FlexContainer width="auto" color="auto" column>
    <span class="mono sm oneline" class:disabled={!profile.enabled}>{profile.type === 'pgp' ? profile.fingerprint : profile.serial}</span>
    <FlexContainer align_items="center" gap="0.2rem">
      <span class="xs" class:disabled={!profile.enabled}><strong>User {profile.type === 'pgp' ? 'Key Fingerprint' : 'Cert Serial'}</strong></span>
      {#if !profile.enabled}
        <OfflineBoltIcon dimension="12px" color="var(--warning-color)" />
      {/if}
    </FlexContainer>
  </FlexContainer>
</button>
<div class="two-rows no-mobile">
  <FlexContainer width="auto" column nomobile>
    <span class="sm oneline">{formatDate(profile.created_at, { dateOnly: true })}</span>
    <span class="xs"><strong>Created</strong></span>
  </FlexContainer>
</div>
<div class="two-rows">
  <FlexContainer width="auto" column>
    <span class="sm oneline">{expired ? formatDuration(profile.expires_at - $minuteTimer) : formatDate(profile.expires_at, { dateOnly: true, default: 'Never' })}</span>
    <span class="xs"><strong>{expired ? 'Expired' : 'Expires on'}</strong></span>
  </FlexContainer>
</div>
{#if expired}
  <div class="two-rows">
    <Button height="auto" width="28px" margin="0" padding="0.2rem 0px" on:click={handleDeleteProfile} disabled={profile.enabled} blendin rounded>
      <DeleteIcon dimension="18px" disabled={profile.enabled} />
    </Button>
  </div>
{:else}
  <Toggle on:click={handleActivationToggle} size="12px" disabled={loading} checked={profile.enabled} />
{/if}
<button
  class="key"
  on:click={() => {
    modalOpened = { isUserKey: false };
  }}
>
  <FlexContainer width="auto" column>
    <span class="mono sm oneline" class:disabled={expired}>{profile.type === 'pgp' ? profile.mr_fingerprint : 'AUTO-GENERATED'}</span>
    <span class="xs" class:disabled={expired}><strong>Relay {profile.type === 'pgp' ? 'Key Fingerprint' : 'Cert Serial'}</strong></span>
  </FlexContainer>
</button>
{#if !expired}
  <Button height="auto" margin="0" padding="0.2rem 0px" on:click={handleDeleteProfile} disabled={profile.enabled} blendin rounded>
    <DeleteIcon dimension="18px" disabled={profile.enabled} />
  </Button>
{/if}

<style>
  .two-rows {
    grid-row-end: span 2;
  }

  button:hover {
    cursor: pointer;
    filter: brightness(var(--base-hover-brightness));
  }

  button.key {
    text-align: left;
    margin: 0px;
    padding: 0px;
    border-style: none;
    background: none;
    color: var(--color);
  }
</style>
