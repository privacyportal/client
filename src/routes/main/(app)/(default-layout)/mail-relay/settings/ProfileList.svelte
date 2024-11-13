<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import GridContainer from '$lib/components/common/GridContainer.svelte';
  import { profiles as profilesStore } from '$lib/stores/profiles';
  import { onDestroy } from 'svelte';
  import Profile from './Profile.svelte';

  const MAX_PROFILES = 3;

  export let openNewProfileModal;

  let profiles;
  let pgpProfiles;
  let smimeProfiles;

  const unsubscribeProfiles = profilesStore.subscribe((value) => {
    profiles = value;
    pgpProfiles = value.filter((p) => p.type === 'pgp');
    smimeProfiles = value.filter((p) => p.type === 'smime');
    console.log('profiles updated', pgpProfiles, smimeProfiles);
  });

  onDestroy(unsubscribeProfiles);
</script>

{#if profiles?.length}
  <FlexContainer margin="0.5rem 0 0 0" column padding="0.5rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
    <FlexContainer align_items="center" justify_content="space-between">
      <h5 class="no-margin">Encryption Profiles</h5>
      <Button on:click={openNewProfileModal} height="auto" padding="0.3rem 0.5rem" primary rounded disabled={profiles.length >= MAX_PROFILES}><small>New Profile</small></Button>
    </FlexContainer>
    <GridContainer
      margin="0 0 0 0"
      justify_items="stretch"
      template_columns="2rem minmax(30vw, auto) auto auto 28px"
      mobile_template_columns="2rem minmax(25vw, auto) minmax(20vw, auto) 28px"
      align_items="center"
      gap="0.7rem 0.7rem"
    >
      <div class="gridline"></div>
      {#each profiles as profile}
        <Profile {profile} />
        <div class="gridline"></div>
      {/each}
    </GridContainer>
  </FlexContainer>
{/if}
