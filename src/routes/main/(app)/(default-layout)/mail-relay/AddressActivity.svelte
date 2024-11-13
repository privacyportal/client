<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import ActivityChart from './ActivityChart.svelte';

  export let metrics;
</script>

<FlexContainer column bgColor="var(--new-layer-color)" padding="1.5rem" gap="0.7rem" rounded mobileScale>
  {#if metrics}
    <h5 class="no-margin">Address Activity</h5>
    <ActivityChart {metrics} />
  {:else}
    <h5 class="no-margin">Address Activity</h5>
    <span class="sm">No activity in the past 14 days.</span>
  {/if}
</FlexContainer>
