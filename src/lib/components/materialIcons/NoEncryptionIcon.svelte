<script>
  export let dimension = '24';
  export let color = 'var(--icon-color)';
  export let disabledColor = 'var(--disabled-color)';
  export let opacity = '1';
  export let disabled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={dimension} height={dimension} fill={disabled ? disabledColor : color} {opacity}>
  <path
    d="m20 17.15-2-2V10h-5.15l-2-2H15V6q0-1.25-.863-2.125Q13.275 3 12.025 3t-2.1.862q-.85.863-.85 2.138v.225L7.25 4.4q.55-1.525 1.875-2.462Q10.45 1 12.025 1 14.1 1 15.55 2.462 17 3.925 17 6v2h1q.825 0 1.413.587Q20 9.175 20 10Zm.5 6.15-1.55-1.55q-.275.125-.5.188Q18.225 22 18 22H6q-.825 0-1.412-.587Q4 20.825 4 20V10q0-.625.363-1.15.362-.525.937-.75L.7 3.5l1.4-1.4 19.8 19.8ZM17.15 20l-3.675-3.725q-.275.275-.637.425-.363.15-.788.15-.825 0-1.412-.588-.588-.587-.588-1.412 0-.425.15-.788.15-.362.425-.637L7.15 10H6v10Zm-5-5Zm3.275-2.425Z"
  />
</svg>
