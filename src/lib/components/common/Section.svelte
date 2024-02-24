<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';

  export let padding = '1rem';
  export let width = '100%';
  export let height = 'auto';
  export let align_items = 'center';
  export let justify_content = 'center';
  export let color = 'auto';
  export let bgColor = 'auto';
  export let rounded = undefined;
  export let border = undefined;
  export let textCentered = undefined;
  export let mediumWidth = undefined;
  export let listItem = undefined;
  export let nooverflow = undefined;
</script>

<FlexContainer column {width} {padding} {height} {textCentered} {listItem} {justify_content} {color} {bgColor} {nooverflow} {border} {rounded}>
  <div class="wrapper" class:m-width={mediumWidth} style:--align-items={align_items}>
    <slot />
  </div>
</FlexContainer>

<style>
  .wrapper {
    width: 100%;
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    align-items: var(--align-items);
  }

  .wrapper.m-width {
    max-width: 870px;
    padding: 0;
  }
</style>
