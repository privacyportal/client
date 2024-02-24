<script>
  export let dimension = '24';
  export let color = 'var(--icon-color)';
  export let disabledColor = 'var(--disabled-color)';
  export let opacity = '1';
  export let disabled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={dimension} height={dimension} fill={disabled ? disabledColor : color} {opacity}>
  <path
    d="m18 20-1.4-1.4 1.575-1.6H14v-2h4.175L16.6 13.4 18 12l4 4ZM4 17q-.825 0-1.412-.587Q2 15.825 2 15V5q0-.825.588-1.413Q3.175 3 4 3h13q.825 0 1.413.587Q19 4.175 19 5v5.1q-.25-.05-.5-.075Q18.25 10 18 10t-.5.012q-.25.013-.5.063V6.4L10.4 11 4 6.425V15h8.075q-.05.25-.063.5-.012.25-.012.5t.025.5q.025.25.075.5ZM5.45 5l4.95 3.55L15.5 5ZM4 15V5v10Z"
  />
</svg>
