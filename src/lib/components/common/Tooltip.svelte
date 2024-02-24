<script>
  export let position = 'top';
  export let text;
  export let small = undefined;
</script>

<div class="tooltip">
  <slot />
  <span class="tooltiptext {position}" class:small>{text}</span>
</div>

<style>
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: var(--tooltip-color);
    color: var(--text-light-opaque-color);
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;
    font-size: 0.9rem;

    /* Position the tooltip text */
    position: absolute;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.5s;
  }

  .tooltip .tooltiptext.right {
    top: -5px;
    left: 105%;
  }

  .tooltip .tooltiptext.right::after {
    content: ' ';
    position: absolute;
    top: 50%;
    right: 100%; /* To the left of the tooltip */
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent var(--tooltip-color) transparent transparent;
  }

  .tooltip .tooltiptext.left {
    top: -5px;
    right: 105%;
  }

  .tooltip .tooltiptext.left::after {
    content: ' ';
    position: absolute;
    top: 50%;
    left: 100%; /* To the right of the tooltip */
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent transparent var(--tooltip-color);
  }

  .tooltip .tooltiptext.top {
    width: 120px;
    bottom: 115%;
    left: 50%;
    margin-left: -60px;
  }

  .tooltip .tooltiptext.top::after {
    content: ' ';
    position: absolute;
    top: 100%; /* At the bottom of the tooltip */
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: var(--tooltip-color) transparent transparent transparent;
  }

  .tooltip .tooltiptext.bottom {
    width: 120px;
    top: 100%;
    left: 50%;
    margin-left: -60px;
  }

  .tooltip .tooltiptext.bottom::after {
    content: ' ';
    position: absolute;
    bottom: 100%; /* At the top of the tooltip */
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent var(--tooltip-color) transparent;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }

  .tooltip .tooltiptext.small {
    font-size: small;
  }
</style>
