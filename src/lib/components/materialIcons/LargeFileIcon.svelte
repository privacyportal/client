<script>
  export let dimension = '24';
  export let color = 'var(--icon-color)';
  export let disabledColor = 'var(--disabled-color)';
  export let opacity = '1';
  export let disabled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width={dimension} height={dimension} fill={disabled ? disabledColor : color} {opacity}>
  <path
    d="M265.8-132q-22.04 0-37.92-15.88Q212-163.76 212-185.78v-588.44q0-22.02 15.88-37.9Q243.76-828 266-828h326l156 155.5V-186q0 22.24-15.88 38.12Q716.24-132 694.2-132H265.8ZM581-662v-144H266q-12 0-22 10t-10 22v588q0 12 10 22t22 10h428q12 0 22-10t10-22v-476H581ZM234-806v144-144 652-652Z"
  />
</svg>
