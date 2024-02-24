<script>
  export let gap = '0px';
  export let margin = 'auto';
  export let padding = '0px';
  export let height = 'auto';
  export let width = '100%';
  export let template_columns = 'auto';
  export let mobile_template_columns = undefined;
  export let template_rows = 'auto';
  export let align_items = 'auto';
  export let justify_items = 'auto';
  export let bgColor = 'auto';
  export let border = undefined;
  export let rounded = undefined;
  export let nooverflow = undefined;
  export let zeroFlexShrink = undefined;
</script>

<div
  class="container"
  style:--gap={gap}
  style:--margin={margin}
  style:--padding={padding}
  style:--width={width}
  style:--height={height}
  style:--bg-color={bgColor}
  style:--grid-template-columns={template_columns}
  style:--mobile-grid-template-columns={mobile_template_columns || template_columns}
  style:--grid-template-rows={template_rows}
  style:--align-items={align_items}
  style:--justify-items={justify_items}
  class:border
  class:rounded
  class:nooverflow
  class:zero-flex-shrink={zeroFlexShrink}
>
  <slot />
</div>

<style>
  .container {
    gap: var(--gap);
    height: var(--height);
    margin: var(--margin);
    padding: var(--padding);
    width: var(--width);
    display: grid;
    grid-template-columns: var(--grid-template-columns);
    grid-template-rows: var(--grid-template-rows);
    align-items: var(--align-items);
    justify-items: var(--justify-items);
    background-color: var(--bg-color);
  }

  .border {
    border: 2px solid var(--border-color);
  }

  .rounded {
    overflow: hidden;
    border-radius: 6px;
  }

  .nooverflow {
    overflow-x: hidden;
  }

  .zero-flex-shrink {
    flex-shrink: 0;
  }

  @media screen and (max-width: 979px) {
    .container {
      grid-template-columns: var(--mobile-grid-template-columns);
    }
  }
</style>
