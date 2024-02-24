<script>
  export let inputElement = undefined;
  export let value = undefined;
  export let name = '';
  export let placeholder = '';
  export let type = 'text';
  export let autocomplete = 'auto';
  export let required = true;
  export let minlength = undefined;
  export let maxlength = undefined;
  export let pattern = undefined;
  export let flexgrow = undefined;
  export let disabled = undefined;
  export let margin = undefined;
  export let icon = undefined;
  export let wide = undefined;
  export let step = '0.01';
  export let min = undefined;
  export let max = undefined;
  export let focus = undefined;

  // https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
  function handleInvalid(event) {
    const { validity } = event.target;
    console.log(validity);
    if (validity.customError || validity.valueMissing) return;
    if (validity.typeMismatch) return event.target.setCustomValidity('Invalid input.');
    if (validity.tooLong) return event.target.setCustomValidity('Input is too long.');
    if (validity.tooShort) return event.target.setCustomValidity('Input is too short.');
    if (validity.patternMismatch) return event.target.setCustomValidity('Invalid input.');
  }

  function init(el) {
    if (focus) el.focus();
  }
</script>

{#if type === 'text'}
  <input
    type="text"
    bind:this={inputElement}
    on:input
    bind:value
    use:init={focus}
    on:invalid={handleInvalid}
    {name}
    {placeholder}
    {required}
    {minlength}
    {maxlength}
    {pattern}
    {autocomplete}
    {disabled}
    class:margin
    class:flexgrow
    class:icon
    class:wide
  />
{:else if type === 'email'}
  <input
    type="email"
    bind:this={inputElement}
    on:input
    bind:value
    use:init={focus}
    on:invalid={handleInvalid}
    {name}
    {placeholder}
    {required}
    {minlength}
    {maxlength}
    {pattern}
    {autocomplete}
    {disabled}
    class:margin
    class:flexgrow
    class:icon
    class:wide
  />
{:else if type === 'password'}
  <input
    type="password"
    bind:this={inputElement}
    on:input
    bind:value
    use:init={focus}
    on:invalid={handleInvalid}
    {name}
    {placeholder}
    {required}
    {minlength}
    {maxlength}
    {pattern}
    autocomplete="off"
    {disabled}
    class:margin
    class:flexgrow
    class:icon
    class:wide
  />
{:else if type === 'number'}
  <input
    type="number"
    bind:this={inputElement}
    on:input
    bind:value
    use:init={focus}
    on:invalid={handleInvalid}
    {name}
    {placeholder}
    {required}
    {step}
    {min}
    {max}
    {disabled}
    class:margin
    class:flexgrow
    class:icon
    class:wide
  />
{/if}

<style>
  input {
    min-height: 35px;
    padding: 0 8px;
    border-radius: 6px;
    background-color: var(--base-color);
    border-color: var(--border-color);
    color: var(--text-color);
  }

  input:not(.icon).wide {
    width: 100%;
  }

  input.icon {
    width: 100%;
    margin-left: -30px;
    margin-right: 0px;
    padding-left: 30px;
  }

  input.icon.wide {
    margin-left: -26px;
    padding-left: 30px;
  }

  input:focus {
    outline-color: var(--primary-color) !important;
  }

  input.flexgrow {
    flex-grow: 1;
    flex-basis: 0;
  }

  input.margin {
    margin: 0 0.5rem 0.5rem 0.5rem;
  }

  input:autofill,
  input:autofill:hover,
  input:autofill:focus,
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    color: var(--text-color);
    -webkit-text-fill-color: var(--text-color);
    box-shadow: 0 0 0px 1000px var(--translucent-primary-color) inset;
    -webkit-box-shadow: 0 0 0px 1000px var(--translucent-primary-color) inset;
  }
</style>
