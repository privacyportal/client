<script>
  import { slugify } from '$lib/modules/utils';
  import { createEventDispatcher } from 'svelte';
  import GridContainer from './GridContainer.svelte';

  const dispatch = createEventDispatcher();

  export let options;
  export let selected = undefined;
  export let xs = false;
  export let width = undefined;
  export let margin = undefined;
  export let padding = xs ? '0.1rem 0.3rem' : '0.3rem';

  $: if (selected !== undefined) {
    dispatch('change', { value: selected });
  }
</script>

<GridContainer {width} {margin} template_columns={`repeat(${options.length}, 1fr)`} rounded border nooverflow>
  {#each options as { value, label, icon }}
    <input type="radio" id={slugify(label)} {value} bind:group={selected} />
    <label class="button" for={slugify(label)} class:icon={icon?.name} style:--padding={padding}>
      {#if icon?.name}
        {#await import(`../materialIcons/${icon.name}.svelte`)}
          <span></span>
        {:then Icon}
          <Icon.default {...icon?.opts} rounded disabled={selected === value} />
        {:catch}
          <span></span>
        {/await}
      {/if}
      <span class="label" class:xs>{label}</span>
    </label>
  {/each}
</GridContainer>

<style>
  .label {
    text-align: center;
    width: auto;
    font-size: 0.9rem;
    padding: var(--padding);
  }

  .button.icon > .label {
    text-align: left;
  }

  .label.xs {
    font-size: 0.7rem;
  }

  input:not(:checked) + .button {
    cursor: pointer !important;
  }

  .button {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    justify-content: flex-start;
    flex: 1 1 0px;
    color: var(--text-color);
    background-color: var(--base-color);
    gap: 0.5rem;
  }

  .button.icon {
    grid-template-columns: auto 1fr;
    padding: 0.1rem 0.3rem;
  }

  .button:not(:last-of-type) {
    border-right: 1px solid var(--border-color);
  }

  .button:not(:first-of-type) {
    border-left: 1px solid var(--border-color);
  }

  input {
    display: none;
  }

  input:checked + .button {
    filter: brightness(var(--base-selection-brightness));
  }
</style>
