<script>
  import { LineChart, Interpolation, easings } from 'chartist';
  import { onMount, onDestroy } from 'svelte';
  import FlexContainer from '$lib/components/common/FlexContainer.svelte';
  import { addMonthsToTimestamp, getMonthNameFromTS, getMonthStartTS, timestampToMS } from '$lib/modules/utils';

  export let selected;
  export let metrics;
  $: updateChart(metrics) || selected;

  let element;
  let tooltip;
  let tooltipLabel;
  let tooltipCountValue;
  let tooltipTimer;
  let tooltipSelectedIndex = 0;
  let chart;

  function resetTooltipSelection() {
    clearTimeout(tooltipTimer);
    tooltipSelectedIndex = 0;
  }

  function updateChart(metrics) {
    if (chart) {
      resetTooltipSelection();
      chart.update(extractData(metrics));
    }
  }

  function extractData(metrics) {
    let labels = [];
    let usageData = [];

    const monthStartTS = getMonthStartTS();
    for (let monthOffset = -5; monthOffset <= 0; monthOffset++) {
      const monthTS = addMonthsToTimestamp(monthStartTS, monthOffset);
      const label = getMonthNameFromTS(monthTS);
      const data = {
        label: getMonthNameFromTS(monthTS, 'long'),
        count: metrics?.[`${timestampToMS(monthTS)}`] || 0
      };

      labels.push(label);
      usageData.push({ meta: JSON.stringify(data), value: data.count });
    }

    return {
      labels,
      series: [usageData]
    };
  }

  onMount(() => {
    chart = new LineChart(
      element,
      extractData(metrics),
      {
        low: 0,
        showArea: true,
        showLine: true,
        showPoint: true,
        fullWidth: true,
        axisX: {
          showLabel: true,
          showGrid: true
        },
        axisY: {
          onlyInteger: true
        },
        lineSmooth: Interpolation.simple({ divisor: 0 })
      },
      [
        [
          'screen and (min-width: 401px) and (max-width: 701px)',
          {
            axisX: {
              labelInterpolationFnc: (value, index) => (index % 2 === 1 ? value : '')
            }
          }
        ],
        [
          'screen and (max-width: 400px)',
          {
            axisX: {
              labelInterpolationFnc: (value, index) => (index % 3 === 1 ? value : '')
            }
          }
        ]
      ]
    );

    chart.on('draw', (data) => {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 0,
            dur: 1000,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: easings.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        data.element.animate({
          opacity: {
            begin: 800,
            dur: 500,
            from: 0,
            to: 1,
            easing: 'easeOutQuart'
          }
        });

        data.element._node.addEventListener('click', (e) => {
          resetTooltipSelection();
          tooltip.style.top = data.y > 50 ? data.y - 60 + 'px' : data.y + 5 + 'px';
          tooltip.style.left = data.x > 200 ? data.x - 85 + 'px' : data.x + 5 + 'px';

          const { label, count } = JSON.parse(data.meta);
          tooltipLabel = label;
          tooltipCountValue = count > 1 ? `${count} users` : '1 user';

          tooltipSelectedIndex = data.index + 1;
          tooltipTimer = setTimeout(() => (tooltipSelectedIndex = 0), 5000);
        });
      }
    });
  });

  onDestroy(async () => {
    if (chart) {
      chart.detach();
    }
  });
</script>

<FlexContainer column>
  <FlexContainer width="100%" align_items="center" justify_content="center" gap="0.5rem">
    <FlexContainer width="auto" padding="0px 0px 1rem 0px" align_items="flex-start" gap="0.3rem" rounded nohover>
      <div class="legend-color-container legend-series-a" />
      <span class="legend-label oneline mono xs">Active Users</span>
    </FlexContainer>
  </FlexContainer>
  <div bind:this={element} data-selected={tooltipSelectedIndex} class="chart">
    <div bind:this={tooltip} class="chartist-tooltip">
      <FlexContainer column padding="0.5rem">
        <span class="xs"><strong>{tooltipLabel}</strong></span>
        <span class="xs">{tooltipCountValue}</span>
      </FlexContainer>
    </div>
  </div></FlexContainer
>

<style>
  .chart {
    position: relative;
    width: 100%;
    max-height: calc(max(20vh, 150px) + 1rem);
    padding-bottom: 1rem;
  }

  .chartist-tooltip {
    width: 80px;
    position: absolute;
    overflow: hidden;
    background-color: var(--new-layer-x3-color);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 5px;
    opacity: 0;
    visibility: hidden;
    transition: ease-in-out 0.3s;
  }

  .chart:not([data-selected='0']) .chartist-tooltip {
    visibility: visible;
    opacity: 1;
    transition: ease-in-out 0.3s;
  }

  .legend-color-container {
    width: 45px;
    height: 15px;
  }

  .legend-series-a {
    border: 3px solid #00729ccc;
    background: #00729c33;
  }

  :global(.ct-chart-line) {
    overflow: visible;
  }

  :global(.ct-grid) {
    stroke-width: 0.5px;
    stroke-dasharray: 0px;
    stroke: #00000033;
  }

  :global(.ct-chart-line .ct-line) {
    stroke-width: 3px;
    fill: none;
  }

  :global(.ct-chart-line .ct-point) {
    stroke-width: 7px;
    stroke-linecap: round;
  }

  :global(.chart .ct-point:hover) {
    stroke-width: 10px;
  }

  :global(.chart[data-selected='1'] .ct-point:nth-of-type(1)),
  :global(.chart[data-selected='2'] .ct-point:nth-of-type(2)),
  :global(.chart[data-selected='3'] .ct-point:nth-of-type(3)),
  :global(.chart[data-selected='4'] .ct-point:nth-of-type(4)),
  :global(.chart[data-selected='5'] .ct-point:nth-of-type(5)),
  :global(.chart[data-selected='6'] .ct-point:nth-of-type(6)),
  :global(.chart[data-selected='7'] .ct-point:nth-of-type(7)),
  :global(.chart[data-selected='8'] .ct-point:nth-of-type(8)),
  :global(.chart[data-selected='9'] .ct-point:nth-of-type(9)),
  :global(.chart[data-selected='10'] .ct-point:nth-of-type(10)),
  :global(.chart[data-selected='11'] .ct-point:nth-of-type(11)),
  :global(.chart[data-selected='12'] .ct-point:nth-of-type(12)),
  :global(.chart[data-selected='13'] .ct-point:nth-of-type(13)),
  :global(.chart[data-selected='14'] .ct-point:nth-of-type(14)) {
    stroke-width: 10px !important;
  }

  :global(.ct-series) {
    opacity: 1;
    visibility: visible;
    transition: ease-in-out 0.5s;
    fill-opacity: 0.2;
  }

  :global(.series-a-hidden .ct-series-a, .series-b-hidden .ct-series-b) {
    opacity: 0;
    visibility: hidden;
    transition: ease-in-out 0.8s;
  }

  :global(.ct-series-a .ct-point, .ct-series-a .ct-line) {
    stroke: #00729ccc;
  }

  :global(.ct-area) {
    stroke: none;
  }

  :global(.ct-series-a .ct-area) {
    fill: #00729c;
    fill-opacity: 0.2;
  }

  :global(.ct-series-b .ct-point, .ct-series-b .ct-line) {
    stroke: #009c76aa;
  }

  :global(.ct-series-b .ct-area) {
    fill: #009c76;
    fill-opacity: 0.2;
  }

  :global(.ct-label) {
    display: flex;
    fill: #00000066;
    color: var(--text-color);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1;
  }

  :global(.ct-label.ct-horizontal.ct-end) {
    margin-left: -100%;
    align-items: flex-start;
    justify-content: flex-end;
    white-space: nowrap;
    transform: rotate(-30deg) translate(-3px, 3px);
    transform-box: fill-box;
    transform-origin: 100% 0;
    text-anchor: end;
    font-size: x-small;
    text-align: left;
  }

  :global(.ct-label.ct-vertical.ct-start) {
    align-items: flex-end;
    justify-content: flex-end;
    text-align: right;
  }
</style>
