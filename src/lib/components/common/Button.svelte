<script>
  import { onMount } from 'svelte';

  export let type = 'button';
  export let disabled = undefined;
  export let mobile = undefined;
  export let noMobile = undefined;
  export let ascolumn = undefined;
  export let flexgrow = undefined;
  export let blendin = undefined;
  export let basic = undefined;
  export let primary = undefined;
  export let warning = undefined;
  export let danger = undefined;
  export let border = undefined;
  export let element = undefined;
  export let focus = undefined;
  export let rounded = undefined;
  export let roundedIcon = undefined;
  export let selected = undefined;
  export let light = undefined;
  export let strong = undefined;
  export let strongSelect = undefined;
  export let xsmall = undefined;
  export let nohover = undefined;
  export let margin = 'inherit';
  export let padding = 'auto';
  export let height = '35px';
  export let width = 'auto';
  export let align_items = 'center';
  export let gap = '0.5rem';
  export let globalClass = [];

  onMount(() => {
    if (focus) element.focus();
  });
</script>

<button
  on:click
  bind:this={element}
  class={['unselectable', ...(globalClass || [])].join(' ')}
  style:--align-items={align_items}
  style:--width={width}
  style:--height={height}
  style:--padding={padding}
  style:--margin={margin}
  style:--gap={gap}
  {type}
  {disabled}
  class:strong-select={strongSelect}
  class:rounded
  class:rounded-icon={roundedIcon}
  class:selected
  class:flexgrow
  class:ascolumn
  class:blendin
  class:warning
  class:danger
  class:primary
  class:basic
  class:light
  class:border
  class:strong
  class:mobile
  class:no-mobile={noMobile}
  class:xsmall
  class:nohover
>
  <slot />
</button>

<style>
  button {
    display: inline-flex;
    align-items: var(--align-items);
    justify-content: center;
    gap: var(--gap);
    cursor: pointer;
    border-style: none;
    width: var(--width);
    min-height: var(--height);
    height: var(--height);
    --color: var(--text-color);
    --bg-color: var(--base-color);
    --hover-brightness: var(--base-hover-brightness);
    --selection-brightness: var(--base-selection-brightness);
    background-color: var(--bg-color);
    border-color: var(--border-color);
    color: var(--color);
    margin: var(--margin);
    padding: var(--padding);
  }

  button.strong {
    font-weight: 600;
    font-size: 0.9rem;
  }

  button.rounded {
    border-radius: 6px;
    overflow: hidden;
  }

  button.rounded-icon {
    border-radius: 22%;
    overflow: hidden;
  }

  button.border {
    border-width: 2px;
    border-style: solid;
  }

  button.ascolumn {
    --padding: 0.7rem !important;
    flex-direction: column;
    gap: 0rem;
  }

  button.ascolumn {
    border-color: var(--bg-color);
    border-top-width: 0px;
    border-right-width: 0px;
    border-bottom-width: 0px;
    border-left-width: 0.3rem;
  }

  button.xsmall {
    font-size: x-small;
  }

  button.flexgrow {
    flex-grow: 1;
    flex-basis: 0;
  }

  button.selected {
    border-color: var(--primary-color);
    filter: brightness(var(--selection-brightness));
    transition-duration: 0.4s;
    cursor: auto;
  }

  button.selected.strong-select {
    font-weight: 600;
  }

  button:not(.selected):not(.nohover):not(:disabled):hover {
    filter: brightness(var(--hover-brightness));
    transition-duration: 0.2s;
  }

  button.blendin {
    --bg-color: auto;
    --color: auto;
    --selection-brightness: 130%;
    --hover-brightness: 125%;
  }

  button.blendin.selected {
    filter: none;
    background-color: rgba(0, 0, 0, 0.1) !important;
    transition-duration: 0.2s;
    cursor: auto;
  }

  button.blendin:not(.selected):not(.nohover):not(:disabled):hover {
    background-color: rgba(0, 0, 0, 0.05);
    transition-duration: 0.2s;
  }

  button.primary:not(.light) {
    --bg-color: var(--primary-color);
    --color: var(--primary-text-color);
    --selection-brightness: 130%;
    --hover-brightness: 125%;
  }

  button.primary.light {
    --border-color: var(--primary-color);
  }

  button.basic {
    --bg-color: var(--basic-color);
    --color: var(--basic-text-color);
    --selection-brightness: 125%;
    --hover-brightness: 110%;
  }

  button.warning:not(.light) {
    --bg-color: var(--warning-color);
    --color: var(--warning-text-color);
    --selection-brightness: 130%;
    --hover-brightness: 120%;
  }

  button.warning.light {
    --color: var(--warning-color);
  }

  button.danger:not(.light) {
    --bg-color: var(--danger-color);
    --color: var(--danger-text-color);
    --selection-brightness: 130%;
    --hover-brightness: 120%;
  }

  button.danger.light {
    --color: var(--danger-color);
  }

  button:disabled {
    --hover-brightness: 100%;
    cursor: default;
  }

  button:not(.selected):disabled {
    color: var(--disabled-color);
    border-color: var(--disabled-color);
  }

  button:focus {
    outline-color: var(--primary-color) !important;
  }

  @media screen and (max-width: 979px) {
    .mobile {
      display: inline-flex !important;
    }
  }
</style>
