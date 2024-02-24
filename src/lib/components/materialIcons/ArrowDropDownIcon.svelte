<script>
  export let dimension = '24';
  export let color = 'var(--icon-color)';
  export let disabledColor = 'var(--disabled-color)';
  export let opacity = '1';
  export let disabled = false;
  export let opened = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" class:opened viewBox="0 0 24 24" width={dimension} height={dimension} fill={disabled ? disabledColor : color} {opacity}>
  <path d="M7 10l5 5 5-5H7z" />
</svg>

<style>
  svg.opened {
    rotate: 180deg;
  }
</style>
