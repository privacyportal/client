<script>
  import { showSnackbar } from '$lib/stores/snackbar';

  export let textAreaElement = undefined;
  export let value = undefined;
  export let name;
  export let placeholder;
  export let required = true;
  export let minlength = undefined;
  export let maxlength = undefined;
  export let flexgrow = false;
  export let disabled = false;
  export let rows = 5;
  export let cols = 60;

  // https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
  function handleInvalid(event) {
    const { validity } = event.target;
    if (validity.customError || validity.valueMissing) return;
    if (validity.typeMismatch) return event.target.setCustomValidity('Invalid input.');
    if (validity.tooLong) return event.target.setCustomValidity('Input is too long.');
    if (validity.tooShort) return event.target.setCustomValidity('Input is too short.');
    if (validity.patternMismatch) return event.target.setCustomValidity('Invalid input.');
  }

  function isPublicKey(value) {
    return /^(?:\r?\n)*-{5}BEGIN PGP PUBLIC KEY BLOCK-{5}(?:\r?\n)*(?:[=a-zA-Z0-9+/]+(?:\r?\n)*)+-{5}END PGP PUBLIC KEY BLOCK-{5}(?:\r?\n)*/g.test(value);
  }

  function handleDroppedFile(file) {
    if (file.size > 2000) return showSnackbar({ text: 'Public PGP file expected.' });
    console.log(file);

    const fileReader = new FileReader();
    fileReader.addEventListener(
      'load',
      () => {
        const publicKey = fileReader.result;
        if (!isPublicKey(publicKey)) return showSnackbar({ text: 'File should contain a PGP public key.' });
        value = publicKey;
      },
      false
    );

    fileReader.readAsText(file, 'ascii');

    console.log(`… file.name = ${file.name}`);
  }

  function dropHandler(e) {
    if (e.dataTransfer.items) {
      if (e.dataTransfer.items.length > 1) return showSnackbar({ text: 'Cannot drop more than one file.' });

      // Use DataTransferItemList interface to access the file(s)
      [...e.dataTransfer.items].forEach((item) => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile();
          handleDroppedFile(file);
        }
      });
    } else {
      if (e.dataTransfer.files.length > 1) return showSnackbar('Cannot drop more than one file.');

      // Use DataTransfer interface to access the file(s)
      [...e.dataTransfer.files].forEach((file) => {
        handleDroppedFile(file);
      });
    }
  }
</script>

<textarea
  on:drop|preventDefault={dropHandler}
  {rows}
  {cols}
  {name}
  {placeholder}
  bind:this={textAreaElement}
  bind:value
  on:invalid={handleInvalid}
  {required}
  {minlength}
  {maxlength}
  {disabled}
  class:flexgrow
/>

<style>
  textarea {
    min-height: 35px;
    padding: 8px;
    resize: vertical;
    background-color: var(--base-color);
    border-color: var(--border-color);
    color: var(--text-color);
  }

  textarea:focus {
    outline-color: var(--primary-color) !important;
  }

  textarea.flexgrow {
    flex-grow: 1;
    flex-basis: 0;
  }

  textarea:autofill,
  textarea:autofill:hover,
  textarea:autofill:focus,
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover,
  textarea:-webkit-autofill:focus {
    color: var(--text-color);
    -webkit-text-fill-color: var(--text-color);
    box-shadow: 0 0 0px 1000px var(--translucent-primary-color) inset;
    -webkit-box-shadow: 0 0 0px 1000px var(--translucent-primary-color) inset;
  }
</style>
