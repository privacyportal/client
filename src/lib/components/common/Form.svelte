<script>
  export let inherit = false;
  export let width = '100%';

  function checkValidity(event) {
    const { target } = event;
    target.setCustomValidity('');
    target.checkValidity();
  }
</script>

<form on:submit|preventDefault on:changed={checkValidity} on:input={checkValidity} class:inherit style:--width={width}>
  <slot />
</form>

<style>
  form {
    width: var(--width);
    min-width: var(--width);
    max-width: var(--width);
  }

  form.inherit {
    display: inherit;
    flex-direction: inherit;
    gap: inherit;
  }
</style>
