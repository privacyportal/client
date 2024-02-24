<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';

  export let title = '';
</script>

<div class="container">
  <FlexContainer column gap="1rem">
    <FlexContainer gap="1rem" align_items="center" justify_content="space-between">
      <h3 class="no-margin">{title}</h3>
      <slot name="header" />
    </FlexContainer>
    <slot />
  </FlexContainer>
</div>

<style>
  .container {
    border-radius: 15px;
    background-color: var(--new-layer-color);
    padding: 1rem;
    width: 100%;
    max-width: 100%;
    margin-bottom: 2rem;
  }
</style>
