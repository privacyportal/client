<script>
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';

  export let margin = undefined;
  export let options;
  export let selected = options?.[0]?.value;

  const slugify = (str = '') => str.toLowerCase().replace(/ /g, '-').replace(/\./g, '');
</script>

<FlexContainer {margin} rounded border nooverflow>
  {#each options as { value, label }}
    <input type="radio" id={slugify(label)} {value} bind:group={selected} />
    <div class="button">
      <label class="oneline" for={slugify(label)}>{label}</label>
    </div>
  {/each}
</FlexContainer>

<style>
  label {
    text-align: center;
    width: 100%;
    font-size: 0.9rem;
    padding: 0.3rem 0px;
  }

  input:not(:checked) + .button > label:hover {
    cursor: pointer !important;
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 0px;
    color: var(--text-color);
    background-color: var(--base-color);
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
