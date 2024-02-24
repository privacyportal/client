<script>
  export let dimension = '24';
  export let color = 'var(--icon-color)';
  export let disabledColor = 'var(--disabled-color)';
  export let opacity = '1';
  export let disabled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={dimension} height={dimension} fill={disabled ? disabledColor : color} {opacity}>
  <path d="M8 18h8v-2H8Zm0-4h8v-2H8Zm-2 8q-.825 0-1.412-.587Q4 20.825 4 20V4q0-.825.588-1.413Q5.175 2 6 2h8l6 6v12q0 .825-.587 1.413Q18.825 22 18 22Zm7-13V4H6v16h12V9ZM6 4v5-5 16V4Z" />
</svg>
