<script>
  export let dimension = '24';
  export let color = 'var(--icon-color)';
  export let disabledColor = 'var(--disabled-color)';
  export let opacity = '1';
  export let disabled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={dimension} height={dimension} fill={disabled ? disabledColor : color} {opacity}>
  <path
    d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14v-3h-3q-.75.95-1.787 1.475Q13.175 18 12 18t-2.212-.525Q8.75 16.95 8 16H5v3Zm7-3q.95 0 1.725-.55Q14.5 14.9 14.8 14H19V5H5v9h4.2q.3.9 1.075 1.45Q11.05 16 12 16Zm-7 3h14Z"
  />
</svg>
