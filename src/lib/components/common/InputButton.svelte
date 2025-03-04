<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';

  export let margin = false;
  export let hideButton = false;
</script>

<div class:margin class:hide-btn={hideButton}>
  <FlexContainer width="100%" align_items="center" justify_items="center">
    <slot name="input" />
    {#if !hideButton}
      <div class="button">
        <slot name="button" />
      </div>
    {/if}
  </FlexContainer>
</div>

<style>
  .button {
    max-height: 24px;
    z-index: 1;
    margin-right: 6px;
    display: flex;
    align-items: center;
  }

  .margin:not(.hide-btn) {
    margin: 0px 0.5rem 0.5rem 0.5rem;
  }

  @media screen and (max-width: 979px) {
    .margin:not(.hide-btn) {
      margin: 0.5rem;
    }
  }
</style>
