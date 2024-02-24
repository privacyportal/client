<script>
  export let dimension = '34';
  export let color = undefined;
  export let opacity = '0';
  export let animated = undefined;
  export let blueprint = undefined;
  export let portal = undefined;
</script>

<svg
  width={dimension}
  height={dimension}
  viewBox="0 0 5334 5334"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xml:space="preserve"
  style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"
  class:animated
  class:blueprint
>
  {#if blueprint}
    <defs>
      <linearGradient id="BlueprintGradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#76a7e9" />
        <stop offset="100%" stop-color="#486cd8" />
      </linearGradient>
    </defs>
  {/if}
  <g transform="matrix(4.16667,0,0,4.16667,0,0)">
    <path
      id="bg"
      d="M1280,286.336C1280,128.303 1151.7,0 993.664,0L286.336,0C128.303,0 0,128.303 0,286.336L0,993.664C0,1151.7 128.303,1280 286.336,1280L993.664,1280C1151.7,1280 1280,1151.7 1280,993.664L1280,286.336Z"
      style="fill:{color};fill-opacity:{opacity};"
    />
    <path
      id="ring-1"
      d="M1280,286.336C1280,128.303 1151.7,0 993.664,0L286.336,0C128.303,0 0,128.303 0,286.336L0,993.664C0,1151.7 128.303,1280 286.336,1280L993.664,1280C1151.7,1280 1280,1151.7 1280,993.664L1280,286.336ZM1210,304.885C1210,175.248 1104.75,70 975.115,70L394.885,70C265.248,70 160,175.248 160,304.885L160,885.115C160,1014.75 265.248,1120 394.885,1120L975.115,1120C1104.75,1120 1210,1014.75 1210,885.115L1210,304.885Z"
      style="fill:white;"
    />
    <path
      id="ring-2"
      d="M1210,304.885C1210,175.248 1104.75,70 975.115,70L394.885,70C265.248,70 160,175.248 160,304.885L160,885.115C160,1014.75 265.248,1120 394.885,1120L975.115,1120C1104.75,1120 1210,1014.75 1210,885.115L1210,304.885ZM1140,325.671C1140,223.196 1056.8,140 954.329,140L495.671,140C393.196,140 310,223.196 310,325.671L310,784.329C310,886.804 393.196,970 495.671,970L954.329,970C1056.8,970 1140,886.804 1140,784.329L1140,325.671Z"
      style="fill:white;stroke:white;stroke-width:1px;"
    />
    <path
      id="ring-3"
      d="M1140,325.671C1140,223.196 1056.8,140 954.329,140L495.671,140C393.196,140 310,223.196 310,325.671L310,784.329C310,886.804 393.196,970 495.671,970L954.329,970C1056.8,970 1140,886.804 1140,784.329L1140,325.671ZM1070,346.904C1070,271.345 1008.65,210 933.096,210L594.873,210C519.313,210 457.968,271.345 457.968,346.904L457.968,685.096C457.968,760.655 519.313,822 594.873,822L933.096,822C1008.65,822 1070,760.655 1070,685.096L1070,346.904Z"
      style="fill:white;"
    />
    <g transform="matrix(0.47815,0,0,0.478125,457.968,210)">
      <path
        id="ring-4"
        d="M1280,286.336C1280,128.303 1151.7,0 993.679,0L286.321,0C128.296,0 0,128.303 0,286.336L0,993.664C0,1151.7 128.296,1280 286.321,1280L993.679,1280C1151.7,1280 1280,1151.7 1280,993.664L1280,286.336Z"
        style="fill:white;fill-opacity:0;stroke:white;stroke-opacity:0.26;stroke-width:2.09px;"
      />
    </g>
    <!-- P sign -->
    <path
      id="text"
      class:portal
      d="M508.125,829.591C543.016,829.627 574.324,829.621 592.566,829.578C712.197,829.299 763.408,824.124 813.642,785.533C871.559,741.038 895,680.278 895,607.243C895,534.136 874.448,470.941 814.998,424.865C763.262,384.769 703.275,385.947 598.06,385.364C574.734,385.234 542.391,385.013 508.125,385L369.805,385L369.805,1098.74L508.125,1098.74L508.125,829.591ZM508.125,505.77L508.125,708.34C540.413,708.413 584.779,708.448 602.946,708.163C658.895,707.288 692.23,701.971 711.661,687.495C741.419,665.326 752.649,640.358 752.649,607.055C752.649,573.719 741.056,546.652 711.588,525.69C687.634,508.649 656.009,506.347 605.666,505.881C581.865,505.66 539.095,505.7 508.125,505.77Z"
      style="fill:white;"
    />
  </g>
</svg>

<style>
  svg {
    --ring-1-fill-extra-opacity: 0;
    --ring-2-fill-extra-opacity: 0;
    --ring-2-stroke-extra-opacity: 0;
    --ring-3-fill-extra-opacity: 0;
  }

  path#bg {
    transition: 0.5s;
  }

  path#ring-1 {
    fill-opacity: calc(0.4 + var(--ring-1-fill-extra-opacity));
  }

  path#ring-2 {
    fill-opacity: calc(0.25 + var(--ring-2-fill-extra-opacity));
    stroke-opacity: calc(0.32 + var(--ring-2-stroke-extra-opacity));
  }

  path#ring-3 {
    fill-opacity: calc(0.15 + var(--ring-3-fill-extra-opacity));
  }

  path#text.portal {
    opacity: 0;
  }

  svg.animated {
    animation-name: loading;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: ease;
  }

  @keyframes loading {
    0% {
      --ring-1-fill-extra-opacity: 0;
      --ring-2-fill-extra-opacity: 0;
      --ring-2-stroke-extra-opacity: 0;
      --ring-3-fill-extra-opacity: 0;
    }
    10% {
      --ring-1-fill-extra-opacity: -0.05;
      --ring-2-fill-extra-opacity: 0;
      --ring-2-stroke-extra-opacity: 0;
      --ring-3-fill-extra-opacity: 0;
    }
    20% {
      --ring-1-fill-extra-opacity: 0;
      --ring-2-fill-extra-opacity: -0.05;
      --ring-2-stroke-extra-opacity: -0.05;
      --ring-3-fill-extra-opacity: 0;
    }
    30% {
      --ring-1-fill-extra-opacity: 0;
      --ring-2-fill-extra-opacity: 0;
      --ring-2-stroke-extra-opacity: 0;
      --ring-3-fill-extra-opacity: -0.05;
    }
    40% {
      --ring-1-fill-extra-opacity: 0;
      --ring-2-fill-extra-opacity: 0;
      --ring-2-stroke-extra-opacity: 0;
      --ring-3-fill-extra-opacity: 0;
    }
  }

  svg.blueprint path#bg {
    fill: url(#BlueprintGradient) !important;
  }

  svg.blueprint path#text {
    fill-opacity: 0;
    stroke-opacity: 0;
  }

  svg.blueprint path#ring-1 {
    fill-opacity: 0;
  }

  svg.blueprint path#ring-2 {
    fill-opacity: 0;
    stroke-opacity: 0.5;
    stroke-width: 15px !important;
  }

  svg.blueprint path#ring-3 {
    fill-opacity: 0;
  }

  svg.blueprint path#ring-4 {
    fill-opacity: 0;
    stroke-opacity: 0.5 !important;
    stroke-width: 30px !important;
  }
</style>
