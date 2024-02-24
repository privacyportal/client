<script>
  export let dimension = '24';
  export let color = 'var(--icon-color)';
  export let disabledColor = 'var(--disabled-color)';
  export let opacity = '1';
  export let disabled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={dimension} height={dimension} fill={disabled ? disabledColor : color} {opacity}>
  <path d="m7 21-5-5 5-5 1.425 1.4-2.6 2.6H21v2H5.825l2.6 2.6Zm10-8-1.425-1.4 2.6-2.6H3V7h15.175l-2.6-2.6L17 3l5 5Z" />
</svg>

<style>
  svg {
    transform: rotate(90deg);
  }
</style>
