<script>
  import { isPublicPGPKey } from '$lib/modules/pgpUtils';
  import { showSnackbar } from '$lib/stores/snackbar';
  import Button from './Button.svelte';

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
  export let accept = undefined;

  let inputElement;
  export let content;

  function handleImport(e) {
    // setting up the reader
    var reader = new FileReader();
    reader.readAsText(e.target.files[0], 'UTF-8');
    reader.onload = (readerEvent) => {
      if (isPublicPGPKey(readerEvent.target.result)) {
        content = readerEvent.target.result;
      } else {
        return showSnackbar({ text: 'File should contain a PGP public key.' });
      }
    };
  }
</script>

<Button
  on:click={() => inputElement.showPicker()}
  {disabled}
  {mobile}
  {noMobile}
  {ascolumn}
  {flexgrow}
  {blendin}
  {basic}
  {primary}
  {warning}
  {danger}
  {border}
  {element}
  {focus}
  {rounded}
  {roundedIcon}
  {selected}
  {light}
  {strong}
  {strongSelect}
  {xsmall}
  {nohover}
  {margin}
  {padding}
  {height}
  {width}
  {align_items}
  {gap}
  {globalClass}
>
  <slot />
  <input bind:this={inputElement} on:change={handleImport} type="file" {accept} style="display: none;" />
</Button>
