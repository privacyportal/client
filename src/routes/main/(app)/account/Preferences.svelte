<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import Select from '$lib/components/common/Select.svelte';
  import { getPreferences, patchPreferences } from '$lib/modules/requests';
  import { session } from '$lib/stores/account';
  import { onMount } from 'svelte';

  const DARK_MODE_OPTIONS = [
    { text: 'Match browser color scheme', value: 'auto' },
    { text: 'Always use dark mode', value: 'dark' },
    { text: 'Always use light mode', value: 'light' }
  ];

  let loading = false;
  let darkModePreference;

  async function handleDarkModePreferenceChanged() {
    try {
      loading = true;
      console.log(darkModePreference);
      const preference = { dm: darkModePreference };
      await patchPreferences(preference);
      // update theme
      session.update((sessionInfo) => ({ ...sessionInfo, pref: { ...sessionInfo.pref, ...preference } }));
    } finally {
      loading = false;
    }
  }

  async function fetchPreferences() {
    try {
      loading = true;
      const { data } = await getPreferences();
      darkModePreference = data.dm || 'auto';
    } finally {
      loading = false;
    }
  }

  onMount(fetchPreferences);
</script>

<FlexContainer column padding="1rem" bgColor="var(--new-layer-color)" gap="0.5rem" rounded>
  <h4 class="no-margin">Preferences</h4>
  <FlexContainer align_items="center" gap="1rem">
    <h5 class="no-margin">Theme Color</h5>
    <Select width="100%" on:change={handleDarkModePreferenceChanged} bind:value={darkModePreference} options={DARK_MODE_OPTIONS} disabled={loading} />
  </FlexContainer>
</FlexContainer>
