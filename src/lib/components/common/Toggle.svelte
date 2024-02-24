<script>
  export let inputElement = undefined;
  export let checked = undefined;
  export let name;
  export let disabled = false;
  export let size = '14px';
  export let warning = undefined;
  export let danger = undefined;
  export let noColorIfDisabled = undefined;
</script>

<div style:--size={size}>
  <input type="checkbox" on:click bind:this={inputElement} bind:checked {name} {disabled} class:warning class:danger class:no-color={noColorIfDisabled} style:--size={size} />
</div>

<style>
  div {
    --padding: 2px;
    width: calc(var(--size) * 2 + var(--padding) * 2);
    max-height: calc(var(--size) + var(--padding) * 2);
  }

  input {
    appearance: none;
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    cursor: pointer;
    border: 0;
    outline: 0;
    margin: 0px;
    --size: var(--size);
    --padding: 2px;
    max-height: calc(var(--size) + var(--padding) * 2);
  }

  input:disabled {
    cursor: auto;
  }

  /* To create surface of toggle button */
  input:after {
    content: '';
    width: calc(var(--size) * 2 + var(--padding) * 2);
    height: calc(var(--size) + var(--padding) * 2);
    display: inline-block;
    background: var(--disabled-color);
    border-radius: 18px;
    clear: both;
  }

  /* Contents before checkbox to create toggle handle */
  input:before {
    content: '';
    width: var(--size);
    height: var(--size);
    display: block;
    position: absolute;
    left: var(--padding);
    top: var(--padding);
    border-radius: 50%;
    background: var(--base-color);
  }

  /* Shift the handle to left on check event */
  input:checked:before {
    left: calc(var(--padding) + var(--size));
  }

  /* Background color when toggle button will be active */
  input:not(.no-color):checked:after {
    background: var(--positive-color);
  }

  input.warning:not(.no-color):not(.danger):checked:after {
    background: var(--warning-color);
  }

  input.danger:not(.no-color):checked:after {
    background: var(--danger-color);
  }

  input,
  input:before,
  input:after,
  input:checked:before,
  input:checked:after {
    transition: ease 0.1s;
    -webkit-transition: ease 0.1s;
    -moz-transition: ease 0.1s;
    -o-transition: ease 0.1s;
  }
</style>
