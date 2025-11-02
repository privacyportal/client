<script context="module">
  import { displayError } from '$lib/modules/errors';

  export function toggleEventHandler(handler, opts) {
    return async function (event) {
      const { newValue, confirm, cancel } = event.detail;
      try {
        await handler(newValue);
        confirm();
      } catch (err) {
        console.log(err);
        if (opts?.displayError) {
          displayError(err);
        }
        cancel(err);
      }
    };
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let inputElement = undefined;
  export let checked = undefined;
  export let name;
  export let disabled = false;
  export let size = '14px';
  export let warning = undefined;
  export let danger = undefined;
  export let noColorIfDisabled = undefined;
  export let asyncMode = false;

  let processing = false;

  async function handleChange(event) {
    const newValue = event.target.checked;
    if (!disabled && !processing && asyncMode) {
      // Revert the checkbox state temporarily
      event.target.checked = !newValue;

      try {
        processing = true;

        // Dispatch beforechange with the new value
        await new Promise((resolve, reject) => {
          dispatch('beforechange', {
            currentValue: checked,
            newValue,
            confirm: resolve,
            cancel: reject
          });
        });

        // If we get here without throwing, allow the change
        event.target.checked = newValue;
        checked = newValue;
      } catch (error) {
        // Change was rejected, keep checkbox in original state
        event.target.checked = !newValue;
        console.log('Toggle change rejected:', error.message);
      } finally {
        processing = false;
      }
    }

    dispatch('change', { value: newValue });
  }
</script>

<div style:--size={size}>
  <input
    type="checkbox"
    bind:this={inputElement}
    on:change={handleChange}
    bind:checked
    {name}
    disabled={processing || disabled}
    class:warning
    class:processing
    class:danger
    class:no-color={noColorIfDisabled}
    style:--size={size}
  />
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

  input.processing:before {
    background:
      /* Solid center circle */
      radial-gradient(circle at center, var(--base-color) 0, var(--base-color) calc(var(--size) / 2 - 2px), transparent calc(var(--size) / 2)),
      /* Border gradient */ conic-gradient(transparent, transparent 180deg, rgba(255, 255, 255, 0.7) 340deg, transparent 360deg) !important;
    animation: rotate 1.5s linear infinite;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
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
