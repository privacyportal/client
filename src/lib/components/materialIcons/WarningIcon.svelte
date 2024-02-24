<script>
  export let dimension = '24';
  export let color = 'var(--positive-color)';
  export let disabledColor = 'var(--disabled-color)';
  export let opacity = '1';
  export let disabled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" width={dimension} height={dimension} fill={disabled ? disabledColor : color} {opacity}>
  <path d="M1 21 12 2l11 19Zm3.45-2h15.1L12 6ZM12 18q.425 0 .713-.288Q13 17.425 13 17t-.287-.712Q12.425 16 12 16t-.712.288Q11 16.575 11 17t.288.712Q11.575 18 12 18Zm-1-3h2v-5h-2Zm1-2.5Z" />
</svg>
