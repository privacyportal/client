<script>
  import { onMount } from 'svelte';

  export let inputElement = undefined;
  export let value = undefined;
  export let id = undefined;
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
  export let iconWidth = '30px';
  export let button = undefined;
  export let wide = undefined;
  export let step = '0.01';
  export let min = undefined;
  export let max = undefined;
  export let focus = undefined;
  export let mask = undefined;
  export let validateFn = undefined;
  export let danger = undefined;
  let maskFirstFailIndex = undefined;

  $: shouldListenToMaskEvents = !!mask;

  const SUPPORTED_STRING_TYPES = ['text', 'email', 'password', 'tel', 'date', 'time'];

  function characterMaskCheck(charCode, charMask) {
    switch (charMask) {
      case '#':
        return charCode >= 48 && charCode <= 57;
      case '@':
        return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
      case '*':
        return (charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
      default:
        return charCode === charMask.charCodeAt(0);
    }
  }

  function nextMaskEditableChar(mask, startIndex) {
    for (let i = startIndex; i < mask.length; i++) {
      const maskChar = mask.charCodeAt(i);
      if (maskChar === 35 || maskChar === 64 || maskChar === 42) return i;
    }
    return undefined;
  }

  function prevMaskEditableChar(mask, startIndex) {
    for (let i = startIndex; i >= 0; i--) {
      const maskChar = mask.charCodeAt(i);
      if (maskChar === 35 || maskChar === 64 || maskChar === 42) return i;
    }
    return undefined;
  }

  function formatValue(value, mask) {
    // cap value length to mask
    if (value.length > mask.length) {
      value = value.substring(0, mask.length);
    }

    let formatted = '';
    maskFirstFailIndex = undefined;
    let nextEditableChar;
    for (let maskIndex = 0, valueIndex = 0; maskIndex < mask.length; maskIndex++) {
      if (nextEditableChar === undefined || nextEditableChar < maskIndex) {
        nextEditableChar = nextMaskEditableChar(mask, maskIndex);
      }

      const maskChar = mask[maskIndex];
      const valueChar = value[valueIndex];

      if (maskIndex < nextEditableChar) {
        if (maskChar === valueChar) valueIndex++;
        formatted += maskChar;
      } else if (valueIndex >= value.length || !characterMaskCheck(value.charCodeAt(valueIndex), maskChar)) {
        maskFirstFailIndex = nextEditableChar;
        return (formatted += mask.substring(maskIndex).replaceAll(/[#@*]/g, '_'));
      } else {
        formatted += value[valueIndex++];
      }
    }
    return formatted;
  }

  function validateMask(value) {
    if (value.length !== mask.length) return 'Invalid value';
    for (let i = 0; i < mask.length; i++) {
      if (!characterMaskCheck(value.charCodeAt(i), mask[i])) return 'Invalid value';
    }
    return '';
  }

  function handleSelectionChange() {
    if (!mask) return;
    if (maskFirstFailIndex !== undefined && inputElement.selectionStart > maskFirstFailIndex) {
      inputElement.setSelectionRange(maskFirstFailIndex, maskFirstFailIndex);
    }
  }

  function extractMaskEditableCharacters(value, mask, startIndex) {
    let result = '';
    for (let i = startIndex; i < value.length; i++) {
      i = nextMaskEditableChar(mask, i);
      result += value[i];
    }
    return result;
  }

  function handleBackspace(event) {
    if (!mask) return;
    switch (event.keyCode) {
      case 8: {
        event.preventDefault();
        let start, end;

        // (start === 1 && end === 1) is equivalent to (start === 0 && end === 1)
        if (inputElement.selectionStart === inputElement.selectionEnd) {
          if (inputElement.selectionStart > 0) {
            start = inputElement.selectionStart - 1;
            end = start + 1;
          }
        } else {
          start = inputElement.selectionStart;
          end = inputElement.selectionEnd;
        }

        if (start !== undefined) {
          const firstPrecedingEditableIndex = prevMaskEditableChar(mask, inputElement.selectionEnd - 1);
          if (firstPrecedingEditableIndex !== undefined && firstPrecedingEditableIndex < start) {
            start = firstPrecedingEditableIndex;
          }

          // Step 1: extract editable characters after start + length
          const charsToReinsert = extractMaskEditableCharacters(value, mask, end);

          // Step 2: remove all characters after start (inclusive)
          const remainingPrefix = value.substring(0, start);

          // Step 3: Reinsert extracted editable characters accoring to mask
          value = remainingPrefix + charsToReinsert;
        }
      }
    }
  }

  function addMaskEvents(node) {
    node.addEventListener('selectionchange', handleSelectionChange);
    node.addEventListener('keydown', handleBackspace);
  }

  function removeMaskEvents(node) {
    node.removeEventListener('selectionchange', handleSelectionChange);
    node.removeEventListener('keydown', handleBackspace);
  }

  function maskSelectionChange(node) {
    if (shouldListenToMaskEvents) addMaskEvents(node);

    return {
      update({ shouldListenToMaskEvents }) {
        removeMaskEvents(node);
        if (shouldListenToMaskEvents) addMaskEvents(node);
      },
      destroy() {
        removeMaskEvents(node);
      }
    };
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
  function handleInvalid(event) {
    const { validity } = event.target;
    if (validity.customError || validity.valueMissing) return;
    if (validity.typeMismatch) return event.target.setCustomValidity('Invalid input.');
    if (validity.tooLong) return event.target.setCustomValidity('Input is too long.');
    if (validity.tooShort) return event.target.setCustomValidity('Input is too short.');
    if (validity.patternMismatch) return event.target.setCustomValidity('Invalid input.');
  }

  function validateCustom() {
    if (mask) {
      inputElement.setCustomValidity(validateMask(value));
    }

    if (validateFn) {
      inputElement.setCustomValidity(validateFn(value));
    }
  }

  function init(el) {
    if (focus) el.focus();
  }

  $: {
    if (inputElement && pattern) {
      inputElement.setCustomValidity('');
    }
  }

  $: {
    if (mask && value) {
      value = formatValue(value, mask);
      if (maskFirstFailIndex !== undefined) {
        inputElement.setSelectionRange(maskFirstFailIndex, maskFirstFailIndex);
      }
    }
  }

  $: {
    if ((validateFn || mask) && inputElement && value) {
      validateCustom();
    }
  }

  onMount(() => {
    if (inputElement && type !== 'number') {
      inputElement.type = type;
    }
  });
</script>

{#if SUPPORTED_STRING_TYPES.includes(type)}
  <input
    bind:this={inputElement}
    on:input
    on:focusout
    bind:value
    use:init={focus}
    on:invalid={handleInvalid}
    use:maskSelectionChange={{ shouldListenToMaskEvents }}
    {...{ type }}
    {id}
    {name}
    {placeholder}
    {required}
    {disabled}
    {...{
      ...(type === 'date' || type === 'time'
        ? {
            min,
            max,
            step
          }
        : {
            minlength,
            maxlength,
            pattern
          }),
      ...(type === 'password' ? { autocomplete: 'off' } : { autocomplete }),
      ...((validateFn || mask) && { 'data-custom-validate': 'true' })
    }}
    class:margin
    class:flexgrow
    class:icon
    class:button
    class:wide
    class:danger
    style:--icon-width={icon && iconWidth ? iconWidth : null}
  />
{:else if type === 'number'}
  <input
    bind:this={inputElement}
    on:input
    on:focusout
    bind:value
    use:init={focus}
    on:invalid={handleInvalid}
    type="number"
    {id}
    {name}
    {placeholder}
    {required}
    {disabled}
    {min}
    {max}
    {step}
    autocomplete="off"
    class:margin
    class:flexgrow
    class:icon
    class:button
    class:wide
    class:danger
    style:--icon-width={icon && iconWidth ? iconWidth : null}
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

  input:not(.icon):not(.button).wide {
    width: 100%;
  }

  input.icon {
    width: 100%;
    margin-left: -30px;
    margin-right: 0px;
    padding-left: var(--icon-width);
  }

  input.icon.wide {
    margin-left: -26px;
    padding-left: var(--icon-width);
  }

  input.button {
    width: 100%;
    margin-left: 0px;
    margin-right: -45px;
    padding-right: 50px;
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

  input.danger {
    border-color: var(--danger-color) !important;
  }
</style>
