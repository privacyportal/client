<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';

  export let margin = false;
</script>

<div class:margin>
  <FlexContainer align_items="center" justify_items="center">
    <div class="icon">
      <slot name="icon" />
    </div>
    <slot name="input" />
  </FlexContainer>
</div>

<style>
  .icon {
    max-height: 24px;
    z-index: 1;
    margin-left: 6px;
    display: flex;
    align-items: center;
  }

  .margin {
    margin: 0px 0.5rem 0.5rem 0.5rem;
  }

  @media screen and (max-width: 979px) {
    .margin {
      margin: 0.5rem;
    }
  }
</style>
