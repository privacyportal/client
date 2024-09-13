<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import AppUsageChart from './AppUsageChart.svelte';

  export let loading;
  export let selected;
  export let active_users;
</script>

<FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale onlymobile alwaysDisplay={selected}>
  <FlexContainer align_items="center">
    <h4 class="no-margin oneline">Usage Metrics</h4>
  </FlexContainer>

  <div class="gridline" />
  <FlexContainer column gap="0.15rem">
    {#if loading}
      <span class="sm">Loading...</span>
    {:else if !active_users}
      <span class="sm">No activity in the past 6 months.</span>
    {:else}
      <AppUsageChart metrics={active_users} {selected} />
    {/if}
  </FlexContainer>
</FlexContainer>
