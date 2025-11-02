<script>
  export let options = [];
  export let name = undefined;
  export let value = undefined;
  export let disabled = undefined;
  export let width = 'auto';
  export let height = '35px';
  export let padding = '0 8px';
</script>

<div class="wrapper">
  <select bind:value on:change {name} {disabled} style:--width={width} style:--height={height} style:--padding={padding}>
    {#each options as option}
      <option value={option.value} disabled={option.disabled} selected={option.selected}>
        {option.text}
      </option>
    {/each}
  </select>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 1fr;
    width: var(--width);
    min-width: 0;
  }

  select {
    min-height: var(--height);
    height: var(--height);
    padding: var(--padding);
    border-radius: 5px;
    font-family: var(--font-serif);
    font-size: 0.9rem;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background-color: var(--base-color);
    border-color: var(--border-color);
    color: var(--text-color);
  }

  select:focus {
    outline-color: var(--primary-color) !important;
  }
</style>
