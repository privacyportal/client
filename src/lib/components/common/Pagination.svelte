<script>
  import Button from '$lib/components/common/Button.svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import ChevronLeftIcon from '$lib/components/materialIcons/ChevronLeftIcon.svelte';
  import ChevronRightIcon from '$lib/components/materialIcons/ChevronRightIcon.svelte';
  import FirstPageIcon from '$lib/components/materialIcons/FirstPageIcon.svelte';
  import LastPageIcon from '$lib/components/materialIcons/LastPageIcon.svelte';

  export let firstId;
  export let lastId;
  export let nextPage;
  export let isFirstPage;
  export let isLastPage;
</script>

{#if !isFirstPage || !isLastPage}
  <FlexContainer align_items="center" justify_content="center" height="65px">
    <div class="container">
      <Button on:click={nextPage(false, undefined)} padding="0.3rem 0.5rem" disabled={isFirstPage}><FirstPageIcon dimension="22" disabled={isFirstPage} /></Button>
      <Button on:click={nextPage(true, firstId)} padding="0.3rem 0.5rem" disabled={isFirstPage}><ChevronLeftIcon dimension="22" disabled={isFirstPage} /></Button>
      <Button on:click={nextPage(false, lastId)} padding="0.3rem 0.5rem" disabled={isLastPage}><ChevronRightIcon dimension="22" disabled={isLastPage} /></Button>
      <Button on:click={nextPage(true, undefined)} padding="0.3rem 0.5rem" disabled={isLastPage}><LastPageIcon dimension="22" disabled={isLastPage} /></Button>
    </div>
  </FlexContainer>
{/if}

<style>
  .container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    column-gap: 1px;
    justify-items: stretch;
    border-radius: 5px;
    overflow: hidden;
    background-color: var(--border-color);
    border: solid 2px var(--border-color);
  }
</style>
